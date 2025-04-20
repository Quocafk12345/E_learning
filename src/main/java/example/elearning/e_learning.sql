create table answer
(
    id              int identity
        primary key,
    studentID       int not null,
    questionId      int not null
        references student
            on delete cascade
        references question
            on delete cascade,
    answer          nvarchar(255),
    markedForReview bit default 0,
    examSessionId   int not null
        references examSession
)
go
create table Exam
(
    id          int identity
        primary key,
    title       nvarchar(255) not null,
    description nvarchar(max),
    createdAt   datetime default getdate()
)
go
create table examSession
(
    id          int identity
        primary key,
    studentId   int not null
        references student
            on delete cascade,
    examId      int not null
        references Exam
            on delete cascade,
    startedId   datetime default getdate(),
    submittedAt datetime,
    score       int
)
go
create table question
(
    id            int identity
        primary key,
    text          nvarchar(max) not null,
    correctAnswer nvarchar(255) not null
)
go
create table questionOption
(
    id         int identity
        primary key,
    questionId int not null
        references question
            on delete cascade,
    optionText nvarchar(255)
)
go
create table student
(
    id   int identity
        primary key,
    name nvarchar(50) not null
)
go

