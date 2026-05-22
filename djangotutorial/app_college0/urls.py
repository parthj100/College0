from django.urls import path

from . import views

urlpatterns = [
    #the url fields structured as <datatype:var_name> is how our view functions get parameters
    path("", views.index, name="index"), 
    path("submit_student_app/<str:s_name>/<str:s_gpa>/<str:desired_major>", views.submit_student_app, name="submit_student_app"),
    path("submit_instructor_app/<str:i_name>", views.submit_instructor_app, name="submit_instructor_app"),
    path("submit_grad_app/<int:student>", views.submit_grad_app, name="submit_grad_app"),
    path("submit_complaint/<int:s_id>/<int:target_id>/<str:msg>", views.submit_complaint, name="submit_complaint"),
    path("view_student_app_status/<int:sapp_id>", views.view_student_app_status, name="view_student_app_status"),
    path("view_instructor_app_status/<int:iapp_id>", views.view_instructor_app_status, name="view_instructor_app_status"),
]

