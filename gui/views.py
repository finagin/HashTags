from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from api.models import HashTag, Follow
from django.views.decorators.clickjacking import xframe_options_exempt

@xframe_options_exempt
def index(request):
    #return render(request, 'gui/index.html')
    return render(request, 'gui/design.html')

def tests(request):
    return render(request, 'gui/tests.html')
