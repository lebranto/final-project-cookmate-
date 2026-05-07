package com.kh.cookmate.admin.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.kh.cookmate.board.dao.BoardDao;
import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.CookStep;
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
        tag.setTypeName((String) row.get("RCP_PAT2"));   // 국&찌개, 반찬 등
        tag.setDifficult(null);                           // API에 없음
        tag.setCookTime(null);                            // API에 없음
        tag.setCalory(calcCalory(row.get("INFO_ENG")));   // 칼로리 기반 분류
        tag.setAi('N');
        boardDao.insertTag(tag);

        // BOARD 저장
        Board board = new Board();
        board.setTypeNo(tag.getTypeNo());
        board.setBoardTitle((String) row.get("RCP_NM"));
        board.setIntroduce((String) row.get("RCP_PARTS_DTLS"));
        board.setImageUrl((String) row.get("ATT_FILE_NO_MAIN"));
        board.setNickname("공식");
        board.setUserNo(1);  
        board.setIsApiData('Y');
        board.setOpen('Y');
        board.setLikesCount(0);
        board.setBoardDelete('N');
        boardDao.insertBoard(board);

        // 조리 단계 저장
        for (int i = 1; i <= 20; i++) {
            String content = (String) row.get(String.format("MANUAL%02d", i));
            if (content == null || content.trim().isEmpty()) break;

            String img = (String) row.get(String.format("MANUAL_IMG%02d", i));

            CookStep step = new CookStep();
            step.setBoardNo(board.getBoardNo());
            step.setStep(i);
            step.setCookContent(content);
            step.setCookImage(img != null ? img : "");
            boardDao.insertCookStep(step);
        }
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
}