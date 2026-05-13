package com.kh.cookmate.member.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeDto {
    private long boardNo;       
    private String title;      
    private String category;   
    private String thumbClass; 
    private String cookTime;  
    private char open;        
    private int likesCount;   
    private String authorNickname;
    private String imageUrl;
    private String boardPostdate; 
}