from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    
    # Main API endpoints
    path('activities/', views.ActivityEventListView.as_view(), name='activity-list'),
    path('persons/', views.PersonListView.as_view(), name='person-list'),
    path('activities/daily-counts/', views.daily_activity_counts, name='daily-counts'),
    path('activities/first-touchpoints/', views.first_touchpoints, name='first-touchpoints'),
    path('activities/all-data/', views.all_activity_data, name='all-data'),
    
    # Legacy endpoints
    path('random_activity_events/', views.random_activity_events, name='random_activity_events'),
    path('random_persons/', views.random_persons, name='random_persons'),
]