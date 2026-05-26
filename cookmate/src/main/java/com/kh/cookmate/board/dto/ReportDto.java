package com.kh.cookmate.board.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

public class ReportDto {

    @Data
    @NoArgsConstructor
    public static class CommentReportRequest {
        private int userNo;
        private int boardNo;
        private String reportType;
        private String reportReason;
    }
}
