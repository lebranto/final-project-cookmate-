package com.kh.cookmate.admin.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.kh.cookmate.board.dao.BoardDao;
import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.CookStep;
import com.kh.cookmate.board.model.vo.Ingredient;
import com.kh.cookmate.board.model.vo.IngredientSet;
import com.kh.cookmate.board.model.vo.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicApiServiceImpl implements PublicApiService {

    private final BoardDao boardDao;
    private final RestTemplate restTemplate;

    @Value("${public.api.key:sample}")
    private String apiKey;

    private static final String BASE_URL =
        "https://openapi.foodsafetykorea.go.kr/api";

    @Override
    public void fetchAndSaveAll() {
        int start = 1;
        int end = 100;

        while (true) {
            fetchByRange(start, end);

            // 총 개수 확인
            String url = BASE_URL + "/" + apiKey + "/COOKRCP01/json/" + start + "/" + end;
            Map response = restTemplate.getForObject(url, Map.class);
            Map cookrcp = (Map) response.get("COOKRCP01");
            int total = Integer.parseInt(cookrcp.get("total_count").toString());

            if (end >= total) break;
            start += 100;
            end += 100;
        }

        log.info("공식 API 데이터 수집 완료: {}개", getApiRecipeCount());
    }

    @Override
    public void fetchByRange(int start, int end) {
        String url = BASE_URL + "/" + apiKey + "/COOKRCP01/json/" + start + "/" + end;

        try {
            Map response = restTemplate.getForObject(url, Map.class);
            Map cookrcp = (Map) response.get("COOKRCP01");
            List<Map> rows = (List<Map>) cookrcp.get("row");

            if (rows == null || rows.isEmpty()) return;

            for (Map row : rows) {
                saveApiRecipe(row);
            }

            log.info("{}~{}번 레시피 저장 완료", start, end);

        } catch (Exception e) {
            log.error("API 수집 실패 ({}~{}): {}", start, end, e.getMessage());
        }
    }

    @Override
    public int getApiRecipeCount() {
        return boardDao.countApiRecipes();
    }

    // API 데이터 파싱 후 DB 저장
    private void saveApiRecipe(Map row) {

    	// TAG 저장
        Tag tag = new Tag();
        tag.setTypeName((String) row.get("RCP_PAT2"));
        tag.setDifficult(null);
        tag.setCookTime(null);
        tag.setCalory(calcCalory(row.get("INFO_ENG")));
        tag.setAi('N');
        boardDao.insertTag(tag);

        // BOARD 저장
        Board board = new Board();
        board.setTypeNo(tag.getTypeNo());
        board.setBoardTitle((String) row.get("RCP_NM"));
        board.setIntroduce("");              // ← 빈값으로 변경
        String highResImageUrl = (String) row.get("ATT_FILE_NO_MK");
        String mainImageUrl = (String) row.get("ATT_FILE_NO_MAIN");
        board.setImageUrl(
            highResImageUrl != null && !highResImageUrl.isBlank()
                ? highResImageUrl
                : mainImageUrl
        );
        board.setNickname("공식");
        board.setUserNo(1);
        board.setIsApiData('Y');
        board.setOpen('Y');
        board.setLikesCount(0);
        board.setBoardDelete('N');
        boardDao.insertBoard(board);

        // 재료 파싱 후 저장
        String partsDtls = (String) row.get("RCP_PARTS_DTLS");
        if (partsDtls != null && !partsDtls.trim().isEmpty()) {
            IngredientSet set = new IngredientSet();
            set.setBoardNo(board.getBoardNo());
            boardDao.insertIngredientSet(set);

            // 쉼표로 분리해서 재료 저장
            String[] parts = partsDtls.split(",");
            List<Ingredient> ings = new ArrayList<>();
            for (String part : parts) {
                String trimmed = part.trim();
                if (trimmed.isEmpty()) continue;
                Ingredient ing = new Ingredient();
                ing.setSetNo(set.getSetNo());
                ing.setIngredientName(trimmed);
                ing.setQuantity("");
                ing.setUnit("");
                ings.add(ing);
            }
            if (!ings.isEmpty()) boardDao.insertIngredients(ings);
        }

     // 조리 단계 저장
        List<CookStep> steps = new ArrayList<>();
        int stepOrder = 1;

        for (int i = 1; i <= 20; i++) {
            String content = (String) row.get(String.format("MANUAL%02d", i));
            if (content == null || content.trim().isEmpty()) continue; // break → continue

            String img = (String) row.get(String.format("MANUAL_IMG%02d", i));
            CookStep step = new CookStep();
            step.setBoardNo(board.getBoardNo());
            step.setStep(stepOrder++);
            step.setCookContent(content.trim());
            step.setCookImage(img != null ? img : "");
            steps.add(step);
        }

        if (!steps.isEmpty()) boardDao.insertCookSteps(steps);
    }

    // 칼로리 기반 분류
    private String calcCalory(Object eng) {
        if (eng == null || eng.toString().isEmpty()) return "보통";
        try {
            double kcal = Double.parseDouble(eng.toString());
            if (kcal < 400) return "저칼로리";
            if (kcal < 700) return "보통";
            return "고칼로리";
        } catch (NumberFormatException e) {
            return "보통";
        }
    }

    @Override
    @Transactional
    public void migrateIngredients() {

        // 공식 레시피 목록 조회
        List<Map<String, Object>> boards = boardDao.selectApiBoards();

        for (Map<String, Object> board : boards) {
            int boardNo = ((Number) board.get("BOARD_NO")).intValue();
            String introduce = (String) board.get("INTRODUCE");

            if (introduce == null || introduce.trim().isEmpty()) continue;

            // 재료 묶음 생성
            IngredientSet set = new IngredientSet();
            set.setBoardNo(boardNo);
            boardDao.insertIngredientSet(set);

            // 쉼표로 분리해서 재료 저장
            String[] parts = introduce.split(",");
            List<Ingredient> ings = new ArrayList<>();
            for (String part : parts) {
                String trimmed = part.trim();
                if (trimmed.isEmpty()) continue;
                Ingredient ing = new Ingredient();
                ing.setSetNo(set.getSetNo());
                ing.setIngredientName(trimmed);
                ing.setQuantity("");
                ing.setUnit("");
                ings.add(ing);
            }
            if (!ings.isEmpty()) boardDao.insertIngredients(ings);

            // INTRODUCE 비우기
            boardDao.clearIntroduce(boardNo);

            log.info("boardNo {} 재료 마이그레이션 완료", boardNo);
        }
    }
}
