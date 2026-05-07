package com.kh.cookmate.board.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

public class CookStepDto {

    @Data @NoArgsConstructor
    public static class StepWrite {
        private int step;
        private String cookContent;
        private String cookImage;
        private boolean deleted;    // 삭제 플래그
        private boolean isNew;      // 신규 플래그
    }

    @Data @NoArgsConstructor
    public static class StepDetail {
        private int step;
        private String cookContent;
        private String cookImage;
    }
}