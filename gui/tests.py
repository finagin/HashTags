__author__ = 'Artur'

from django.test import TestCase
from django.test.client import Client
from django.core.urlresolvers import reverse

class SimpleTest(TestCase):

    def setUp(self):
        self.c = Client()

    def test_index_page(self):
        response = self.c.get('/gui/')
        self.assertEquals(response.status_code, 200)
        self.assertEquals(reverse('gui:index'), '/gui/')
        self.assertTemplateUsed(response, 'gui/index.html')
        self.assertContains(response, "New")
        self.assertContains(response, "Select")
