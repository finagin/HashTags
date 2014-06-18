# -*- coding: utf-8 -*-

import json

from django.shortcuts import render
from django.http import HttpResponse

from api.models import HashTag, Follow


def index(request):
    return render(request, 'api/wiki.html')


def allGroups(request):
    return HttpResponse(json.dumps({"response": list(HashTag.objects.values_list('ht_gid', flat=True).distinct())}))


def getTags(request, gid):
    gids = HashTag.objects.select_related().filter(ht_gid=gid).values('ht_id', 'ht_text')
    temp = []
    for i in gids:
        id = i['ht_id']
        text = i['ht_text']
        p = {"hid": id, "text": text}
        temp.append(p)
    return HttpResponse(json.dumps({"response": temp}))


def getFollowers(request, hid):
    users = list(Follow.objects.select_related().filter(follow_ht=hid).values_list('follow_uid', flat=True))
    return HttpResponse(json.dumps({"response": users}))


def followHashTag(request, uid, hid, uids):
    uid.encode('utf-8', 'ignore')
    uids.encode('utf-8', 'ignore')
    temp = uids.split(',')
    h = HashTag.objects.filter(ht_id=hid).select_related()
    follow = Follow.objects.filter(follow_ht=hid).select_related()
    b = False
    for t in temp:
        if t == uid:
            b = True
        if follow.filter(follow_uid=t).exists():
            continue
        else:
            f = Follow()
            f.follow_ht = h[0]
            f.follow_uid = t
            f.follow_type = 1
            f.save()
    if b:
        res = '{"response": 1}'
    else:
        res = '{"response": 0}'
    return HttpResponse(res)


def createHashTag(request, gid, text):
    if not HashTag.objects.filter(ht_gid=gid, ht_text=text).exists():
        ht = HashTag()
        ht.ht_text = text
        ht.ht_gid = gid
        ht.save()
        isfollow = False
        d = list(HashTag.objects.select_related().filter(ht_gid=gid, ht_text=text).values_list('ht_id', flat="True"))
        j = {'response': {"gid":gid,
                                      "tag":{
                                            "text": text,
                                            "hid": d[0],
                                            "isfollow": isfollow
                                      }
                         }
            }
        return HttpResponse(json.dumps(j))
    else:
        return HttpResponse('{"response": 0}')


def unFollowHashTag(request, hid, uid):
    f = Follow.objects.filter(follow_ht=hid).select_related()
    f.filter(follow_uid=uid).delete()
    bool = 0
    if len(f) == 0:
        bool = 1
        HashTag.objects.filter(ht_id=hid).delete()
    j = json.dumps({'response': (bool)})
    return HttpResponse(j)

####################################################

def checkGroups(request, gid):
    temp = gid.split(',')
    setGid = HashTag.objects.values('ht_gid').distinct()
    checkGid = []
    for t in temp:
        if setGid.filter(ht_gid=t).exists():
            checkGid.append(t)
            continue
    result = {"response": checkGid}
    return HttpResponse(json.dumps(result))

def getTagsForGroups(request, uid, gids):
    groupsid = gids.split(',')
    temp = []
    for i in groupsid:
        gid = HashTag.objects.filter(ht_gid=i).values('ht_id', 'ht_text').select_related()
        if HashTag.objects.filter(ht_gid=i).exists():
            temp2 = []
            for j in gid:
                id   = j['ht_id']
                text = j['ht_text']
                b = False
                if Follow.objects.filter(follow_uid=uid, follow_ht=id).exists():
                    b = True
                p = {"hid": id, "text": text, "isfollow": b}
                temp2.append(p)
            temp.append({"tags": temp2, "gid": i})
        else:
            continue
    return HttpResponse(json.dumps({"response": temp}))