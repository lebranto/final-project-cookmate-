package com.kh.cookmate.board.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

public class CookStepDto {
	@Data
    @NoArgsConstructor
    public static class StepWrite {
        private int step;
        private String cookContent;
        private String cookImage;   // S3 URL (선택)
    }

    @Data
    @NoArgsConstructor
    public static class StepDetail {
        private int step;
        private String cookContent;
        private String cookImage;
    }
}
