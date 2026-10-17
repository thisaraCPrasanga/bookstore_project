package com.thisara.bookstore.shared;

public class ConflictException extends RuntimeException{

    public ConflictException(String message){
        super(message);
    }
}
