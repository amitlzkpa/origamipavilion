from django.shortcuts import render

# Create your views here.


def play(request):
    return render(request, 'lporigami/play.html', {})


def test(request):
    return render(request, 'lporigami/test.html', {})
