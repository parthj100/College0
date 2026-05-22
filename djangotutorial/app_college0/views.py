from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import *

# registrar functionality is almost done, thanks to django's admin functionality

def index(request):
    return HttpResponse(render(request, "app_college0/Landing.jsx"))
    
def submit_student_app(request, s_name, s_gpa, desired_major):
    s_app = Student_Apply(name=s_name, gpa=float(s_gpa), prog=desired_major)
    s_app.save()
    y = Student_Apply.objects.get(name=s_name, gpa=float(s_gpa))
    return HttpResponse("Your application id is %s" % y.app_id)
    
def submit_instructor_app(request, i_name):#intend to improve, along with model of instructor app
    i_app = Instructor_Apply(name=i_name)
    i_app.save()
    y = Instructor_Apply.objects.get(name=i_name)
    return HttpResponse("Your application id is %s" % y.app_id)
    
def submit_grad_app(request, student):
    g_app = Grad_Apply(applicant=student)
    g_app.save()
    
def submit_complaint(request, s_id, target_id, msg):
    comp = Complaint(source=s_id, target=target_id, text=msg)
    comp.save()

def view_student_app_status(request, sapp_id):
    entry = Student_Apply.objects.get(app_id=sapp_id)
    stat = entry.app_status
    if (stat == "accepted"):
    	return HttpResponse("Congratulations, you have been accepted. Your account login is " )
    else:
        if (stat == "rejected"):
            entry.delete()
        return HttpResponse("Your application status is %s" % stat)

def view_instructor_app_status(request, iapp_id):
    entry = Student_Apply.objects.get(app_id=iapp_id)
    stat = entry.app_status
    if (stat == "accepted"):
    	return HttpResponse("Congratulations, you have been accepted. Your account login is " )
    else:
        if (stat == "rejected"):
            entry.delete()
        return HttpResponse("Your application status is %s" % stat)
        
"""
def submit_course_review(request,stu,sub,rating,msg):
    enr = Enrollment.objects.get(student.s_id=stu,offering.course_id=sub)
    if (enr.grade != -1.0):
    	return HttpResponse("You have alrady been graded, it is too late to review")
    x = 0
    for word in msg.split():
    	if (word in Taboo_List.objects.all().word):
    	    x += 1
    	    word = "*"
    rev = Review(subject=enr, score=rating, review_text=msg, taboo_words=x)
    rev.save()
    #also change instructor rating and course rating
    
    return HttpResponse("Review submitted. # of taboo words: %s" % x) 
def enroll_course(request, c_offer, s_id): 
    #if normal registration not over, continue, else return HttpResponse("Registration is over for you")
    #if already enrolled, return HttpResponse("You are already enrolled")
    #if waitlisted, return HttpResponse("You are already waitlisted")
    #if enrolled in same course, diff offering, swap
    #if waitlisted in same course, diff offering, swap
    #if student taking 4 courses, return HttpResponse("limit of courses reached")
    #if time1 or time2 (start times) of any other classes enrolled by student are the same as this offering, 
    	#HttpResponse("time conflict with (course name of other class)
    #if student history shows student passed this course, HttpResponse("You have taken and passed this course")
    #if This_class_offering.available_seats ==0, create waitlist entry in DB
def special_registration(request, c_offer, s_id): 
    #Registrar will give students access to this manually.
    # SAME LOGIC AS enroll_course, EXCEPT REPLACE "normal reg." WITH "special reg.".

def drop_course(request, c_offer, s_id):
    #look for Enrollment entry in DB
    #if exists, delete from table.
    
def assign_grade(request, class_member, class_offering, input_grade)
    #if grade < 0.0 or grade > 4.0, HttpResponse("invalid grade")
    #if grading period not over, entry=Enrollments.objects.get(student=class_member,offering=class_offering)
    #
"""
