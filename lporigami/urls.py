from django.conf.urls import url
from . import views



urlpatterns = [
    url(r'^$', views.play, name='play'),
    url(r'^test/$', views.test, name='test'),
]