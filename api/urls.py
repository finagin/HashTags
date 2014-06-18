# -*- coding: utf-8 -*-

from django.conf.urls import patterns, url

urlpatterns = patterns('api.views',

    url(r'^$', 'index', name='index'),
    url(r'^allGroups$', 'allGroups', name='allGroups'),
    url(r'^getTags/(?P<gid>\d+)$', 'getTags', name='getTags'),
    url(r'^getTagsForGroups/(?P<uid>\d+)/(?P<gids>(\d+,)*\d+$)$', 'getTagsForGroups', name='getTagsForGroups'),
    url(r'^getFollowers/(?P<hid>\d+)$', 'getFollowers', name='getFollowers'),
    url(r'^createHashTag/(?P<gid>\d+)/(?P<text>\w+)$', 'createHashTag', name='createHashTag'),
    url(r'^follow/(?P<uid>\d+)/(?P<hid>\d+)/(?P<uids>(\d+,)*\d+$)', 'followHashTag', name='followHashTag'),
    url(r'^unFollowHashTag/(?P<hid>\d+)/(?P<uid>\d+)$', 'unFollowHashTag', name='unFollowHashTag'),
    url(r'^checkGroups/(?P<gid>(\d+,)*\d+$)', 'checkGroups', name='checkGroups'),
)
