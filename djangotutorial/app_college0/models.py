from django.db import models

# still need to add: 
#	some amount of account information, depending on how much work django does with accounts and authentication
#	some unifying User entity, which can hold students and instructors (helps with complaints between roles)

class Course(models.Model):
    c_id = models.IntegerField(primary_key=True)
    c_name = models.CharField(max_length=30)
    #credits = models.IntegerField(default=0)
    department = models.CharField(max_length=20)
    avg_rating = models.FloatField()

class Program(models.Model):
    p_name = models.CharField(primary_key=True, max_length=20)
    department = models.CharField(max_length=20)
    quota = models.IntegerField()

class Prog_Req(models.Model):
    p_id = models.ForeignKey(Program, on_delete=models.CASCADE)
    requirements = models.ForeignKey(Course, on_delete=models.CASCADE)

#this is to sort program requirements by major, not an actual entity
class Major_Req_List(Prog_Req):
    class Meta:
        proxy = True
        verbose_name = "Major"
        verbose_name_plural = "Majors"

class Instructor(models.Model):
    i_id = models.IntegerField(primary_key=True)
    i_name = models.CharField(max_length=25)
    warnings = models.IntegerField(default=0)
    department = models.CharField(max_length=20)
    i_email = models.EmailField()
    current_rating =  models.FloatField()
    num_curr_courses = model.IntegerField()
    #suspended = models.IntegerField() #equal to 1 or zero
    
class Student(models.Model): #use "enrollment" entity to determine number of classes taken
    s_id = models.IntegerField(primary_key=True)
    s_name = models.CharField(max_length=25)
    total_gpa = models.FloatField()
    semester_gpa = models.FloatField()
    warnings = models.IntegerField(default=0)
    program = models.CharField(max_length=20) # p_name of Program entity
    s_email = models.EmailField()
    num_curr_courses = model.IntegerField()
    #suspended = models.IntegerField() #equal to 1 or zero
    
class Student_Course_Hist(models.Model):#we save this to the DB once the student completes the course (not withdrawn)
    # if they failed and retook it, we modify the existing object
    s_id = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_taken = models.ForeignKey(Course, on_delete=models.DO_NOTHING) #course_id
    failures = models.IntegerField(default=0)
    passed = models.IntegerField(default=0)
    
class ClassOffering(models.Model):
    offer_id = models.IntegerField(primary_key=True)
    course_id = models.IntegerField()
    available_seats = models.IntegerField()
    instructor = models.IntegerField()
    day1 = models.CharField(max_length=3) #days of the week
    day2 = models.CharField(max_length=3) #days of the week 
    time1 = models.TimeField() # class hours
    time2 = models.TimeField() # class hours of second day

class Enrollment(models.Model):
    #pk = models.CompositePrimaryKey("student", "offering")
    student = models.ForeignKey(Student, on_delete=models.CASCADE) # student id
    offering = models.ForeignKey(ClassOffering, on_delete=models.CASCADE)
    grade = models.FloatField(default=-1.0) #default -1 until grade is given
    
class Waitlist_Entry(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE) # student id
    offering = models.ForeignKey(ClassOffering, on_delete=models.CASCADE)
    placement = models.IntegerField() # we auto-increment for each course offering, and let people in by ordering
    
class Review(models.Model):
    subject = models.OneToOneField(Enrollment,on_delete=models.DO_NOTHING) #contains student and class
    score = models.IntegerField()
    review_text = models.CharField(max_length=200)
    taboo_words = models.IntegerField()
    
class AIquery(models.Model):
    query_id = models.IntegerField(primary_key=True)
    text = models.CharField(max_length=200)

class Complaint(models.Model):
    source = models.IntegerField()
    target = models.IntegerField()
    text = models.CharField(max_length=200)
    
class Student_Apply(models.Model):
    app_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=25)
    app_status = models.CharField(max_length=8,default="pending")
    gpa = models.FloatField()
    prog = models.CharField(max_length=20)
	#we'll probably deal with file uploads after most things are done    
    #transcript = models.FileField(upload_to="transcripts/")
    
class Instructor_Apply(models.Model):
    app_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=25)
    app_status = models.CharField(max_length=8,default="pending")
    #resume = models.FileField(upload_to="resumes/")
    
class Grad_Apply(models.Model):
    app_id = models.IntegerField(primary_key=True)
    app_status = models.CharField(max_length=8,default="pending")
    applicant = models.IntegerField()
    #gpa = models.FloatField()
