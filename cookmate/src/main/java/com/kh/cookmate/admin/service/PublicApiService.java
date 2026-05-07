package com.kh.cookmate.admin.service;

public interface PublicApiService {

    // 전체 데이터 수집 (최초 1회)
    void fetchAndSaveAll();

    // 특정 범위만 수집
    void fetchByRange(int start, int end);

    // 수집된 공식 레시피 수 확인
    int getApiRecipeCount();
}