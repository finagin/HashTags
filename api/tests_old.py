from django.test import TestCase
from django.core.urlresolvers import reverse
from django.test.client import Client

class SimpleTest(TestCase):

    def setUp(self):
        self.c = Client()

    def test(self):
        response = self.c.get(reverse('api:allGroups'))

        self.assertEquals(response.status_code, 200)

    def test_views_allGroup(self):
        response = self.c.get("")