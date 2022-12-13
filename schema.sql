-- init
create table todolist (
    id int not null auto_increment,
    text varchar(50) not null,
    remindDate date,
    done bit(1) not null,
    primary key (id)
);
