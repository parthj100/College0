from django.contrib import admin

from .models import *

admin.site.register(Student_Apply)
admin.site.register(Instructor_Apply)
admin.site.register(Grad_Apply)
admin.site.register(Student)
admin.site.register(Instructor)

admin.site.register(Program)
admin.site.register(Prog_Req)
admin.site.register(Course)
admin.site.register(ClassOffering)

@admin.register(Major_Req_List)
class Major_Req_ListAdmin(admin.ModelAdmin):
    change_list_template = 'admin/Prog_Req_change_list.html'
    hierarchy = 'Program'
