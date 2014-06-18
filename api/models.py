# -*- coding: utf-8 -*-

from django.db import models


class HashTag(models.Model):
    ht_id = models.AutoField(primary_key=True)
    ht_text = models.CharField(max_length=15)
    ht_gid = models.BigIntegerField(max_length=30)
    def __unicode__(self):
       return unicode(self.ht_text)

class Follow(models.Model):
    follow_ht = models.ForeignKey(HashTag, to_field='ht_id')
    follow_uid = models.BigIntegerField()
    follow_type = models.SmallIntegerField()
    class Meta:
        unique_together = ('follow_ht','follow_uid')
    def __unicode__(self):
        return unicode(self.follow_uid)