from django.conf.urls import patterns, include, url

urlpatterns = patterns('gui.views',

    url(r'^$', 'index', name='index'),
    url(r'^tests', 'tests', name='tests'),

)