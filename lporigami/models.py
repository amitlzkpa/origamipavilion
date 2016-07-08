from django.db import models
from django.utils import timezone

# Create your models here.
class objStore(models.Model):
	uniqueID = models.AutoField(primary_key=True)
	userIP = models.GenericIPAddressField()
	createdDate = models.DateTimeField(default=timezone.now)
	objText = models.TextField()

