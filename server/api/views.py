from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db.models import QuerySet, Count, Min
from django.db.models.functions import TruncDate
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import ActivityEvent, Person
from .serializers import (
    ActivityEventSerializer, 
    PersonSerializer,
    DailyActivityCountSerializer,
    FirstTouchpointSerializer
)


# Create your views here.

def index(request):
    return HttpResponse("Hello, world! This is the API root.")


# -----------------------------------------------------------------------------
# Custom Pagination
# -----------------------------------------------------------------------------

class LargeResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500


# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------

class ActivityEventListView(generics.ListAPIView):
    """
    List all activity events with pagination.
    Supports filtering by customer_org_id and account_id.
    """
    serializer_class = ActivityEventSerializer
    pagination_class = LargeResultsSetPagination
    
    def get_queryset(self):
        queryset = ActivityEvent.objects.all()
        
        # Filter by customer_org_id if provided
        customer_org_id = self.request.query_params.get('customer_org_id')
        if customer_org_id:
            queryset = queryset.filter(customer_org_id=customer_org_id)
        
        # Filter by account_id if provided
        account_id = self.request.query_params.get('account_id')
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        
        # Filter by direction if provided
        direction = self.request.query_params.get('direction')
        if direction:
            queryset = queryset.filter(direction=direction)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset.order_by('-timestamp')


class PersonListView(generics.ListAPIView):
    """
    List all persons with pagination.
    Supports filtering by customer_org_id.
    """
    serializer_class = PersonSerializer
    pagination_class = PageNumberPagination
    
    def get_queryset(self):
        queryset = Person.objects.all()
        
        # Filter by customer_org_id if provided
        customer_org_id = self.request.query_params.get('customer_org_id')
        if customer_org_id:
            queryset = queryset.filter(customer_org_id=customer_org_id)
        
        return queryset


@api_view(['GET'])
def daily_activity_counts(request):
    """
    Get daily counts of activities with direction='IN'.
    Used for the minimap line chart.
    """
    # Get query parameters
    customer_org_id = request.GET.get('customer_org_id')
    account_id = request.GET.get('account_id')
    
    # Build base queryset
    queryset = ActivityEvent.objects.filter(direction='IN')
    
    if customer_org_id:
        queryset = queryset.filter(customer_org_id=customer_org_id)
    if account_id:
        queryset = queryset.filter(account_id=account_id)
    
    # Aggregate by date
    daily_counts = (
        queryset
        .annotate(date=TruncDate('timestamp'))
        .values('date')
        .annotate(count=Count('touchpoint_id'))
        .order_by('date')
    )
    
    serializer = DailyActivityCountSerializer(daily_counts, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def first_touchpoints(request):
    """
    Get the first touchpoint for each person.
    Used for the minimap markers.
    """
    # Get query parameters
    customer_org_id = request.GET.get('customer_org_id')
    account_id = request.GET.get('account_id')
    
    # Build base queryset
    queryset = ActivityEvent.objects.all()
    
    if customer_org_id:
        queryset = queryset.filter(customer_org_id=customer_org_id)
    if account_id:
        queryset = queryset.filter(account_id=account_id)
    
    # Get all activities and find first touchpoint per person
    first_touchpoints = []
    person_first_touch = {}
    
    # Get all persons
    persons = Person.objects.all()
    if customer_org_id:
        persons = persons.filter(customer_org_id=customer_org_id)
    
    person_dict = {p.id: p for p in persons}
    
    # Iterate through activities to find first touchpoint per person
    for event in queryset.order_by('timestamp'):
        if event.people:
            for person_ref in event.people:
                person_id = person_ref.get('id')
                if person_id and person_id not in person_first_touch:
                    person = person_dict.get(person_id)
                    if person:
                        person_first_touch[person_id] = {
                            'person_id': person_id,
                            'person_name': f"{person.first_name} {person.last_name}",
                            'timestamp': event.timestamp,
                            'date': event.timestamp.date(),
                        }
    
    first_touchpoints = list(person_first_touch.values())
    serializer = FirstTouchpointSerializer(first_touchpoints, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def all_activity_data(request):
    """
    Get all activity data in a single request for initial load.
    This is a convenience endpoint for the frontend.
    """
    # Get query parameters
    customer_org_id = request.GET.get('customer_org_id', 'org_4m6zyrass98vvtk3xh5kcwcmaf')
    account_id = request.GET.get('account_id', 'account_31crr1tcp2bmcv1fk6pcm0k6ag')
    
    # Get activities
    activities = ActivityEvent.objects.filter(
        customer_org_id=customer_org_id,
        account_id=account_id
    ).order_by('-timestamp')
    
    # Get daily counts for minimap
    daily_counts = (
        ActivityEvent.objects
        .filter(
            customer_org_id=customer_org_id,
            account_id=account_id,
            direction='IN'
        )
        .annotate(date=TruncDate('timestamp'))
        .values('date')
        .annotate(count=Count('touchpoint_id'))
        .order_by('date')
    )
    
    # Get first touchpoints
    person_first_touch = {}
    persons = Person.objects.filter(customer_org_id=customer_org_id)
    person_dict = {p.id: p for p in persons}
    
    for event in activities.order_by('timestamp'):
        if event.people:
            for person_ref in event.people:
                person_id = person_ref.get('id')
                if person_id and person_id not in person_first_touch:
                    person = person_dict.get(person_id)
                    if person:
                        person_first_touch[person_id] = {
                            'person_id': person_id,
                            'person_name': f"{person.first_name} {person.last_name}",
                            'timestamp': event.timestamp,
                            'date': event.timestamp.date().isoformat(),
                        }
    
    return Response({
        'activities': ActivityEventSerializer(activities[:500], many=True).data,  # Limit initial load
        'daily_counts': DailyActivityCountSerializer(daily_counts, many=True).data,
        'first_touchpoints': list(person_first_touch.values()),
        'total_count': activities.count(),
    })


# Legacy endpoints (keeping for compatibility)

def random_activity_events(request):
    """Return up to 10 random ActivityEvent records for the given customer.

    Query parameters:
    - customer_org_id (required)
    - account_id (required)
    """
    customer_org_id = request.GET.get("customer_org_id")
    account_id = request.GET.get("account_id")

    if not customer_org_id or not account_id:
        return JsonResponse(
            {
                "error": "Both 'customer_org_id' and 'account_id' query parameters are required."
            },
            status=400,
        )

    events_qs: QuerySet = (
        ActivityEvent.objects.filter(
            customer_org_id=customer_org_id, account_id=account_id
        )
        .order_by("?")[:10]
    )

    # Use .values() to get dictionaries of all model fields.
    events = list(events_qs.values())
    return JsonResponse(events, safe=False)

def random_persons(request):
    """Return up to 5 random Person records for the given customer.

    Query parameters:
    - customer_org_id (required)
    """

    customer_org_id = request.GET.get("customer_org_id")

    if not customer_org_id:
        return JsonResponse(
            {"error": "'customer_org_id' query parameter is required."},
            status=400,
        )

    persons_qs: QuerySet = (
        Person.objects.filter(customer_org_id=customer_org_id).order_by("?")[:5]
    )

    persons = list(persons_qs.values())
    return JsonResponse(persons, safe=False)