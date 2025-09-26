from rest_framework import serializers
from .models import ActivityEvent, Person


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ['id', 'first_name', 'last_name', 'email_address', 'job_title']


class PersonInActivitySerializer(serializers.Serializer):
    """Serializer for person data within an activity event."""
    id = serializers.CharField()
    role_in_touchpoint = serializers.CharField(allow_null=True)
    # Add person details when available
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    email_address = serializers.EmailField(read_only=True)
    job_title = serializers.CharField(read_only=True, allow_null=True)


class ActivityEventSerializer(serializers.ModelSerializer):
    people_details = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityEvent
        fields = [
            'touchpoint_id',
            'timestamp',
            'formatted_date',
            'activity',
            'channel',
            'status',
            'direction',
            'people',
            'people_details',
            'involved_team_ids',
            'campaign_name',
            'record_type',
        ]
    
    def get_people_details(self, obj):
        """Enrich people data with person details from the Person model."""
        if not obj.people:
            return []
        
        enriched_people = []
        for person_ref in obj.people:
            person_data = person_ref.copy()
            try:
                person = Person.objects.get(id=person_ref['id'])
                person_data.update({
                    'first_name': person.first_name,
                    'last_name': person.last_name,
                    'email_address': person.email_address,
                    'job_title': person.job_title,
                })
            except Person.DoesNotExist:
                # If person not found, just use the basic data
                pass
            enriched_people.append(person_data)
        
        return PersonInActivitySerializer(enriched_people, many=True).data
    
    def get_formatted_date(self, obj):
        """Return formatted date string."""
        return obj.timestamp.strftime('%Y-%m-%d %H:%M')


class DailyActivityCountSerializer(serializers.Serializer):
    """Serializer for daily activity counts."""
    date = serializers.DateField()
    count = serializers.IntegerField()
    
    
class FirstTouchpointSerializer(serializers.Serializer):
    """Serializer for first touchpoint per person."""
    person_id = serializers.CharField()
    person_name = serializers.CharField()
    timestamp = serializers.DateTimeField()
    date = serializers.DateField()


