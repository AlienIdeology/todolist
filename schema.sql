-- init
create table todolist (
    id int not null auto_increment,
    text varchar(50) not null,
    remindDate date,
    done tinyint(1) not null default 0,
    primary key (id)
);
