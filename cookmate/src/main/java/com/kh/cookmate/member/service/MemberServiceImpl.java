package com.kh.cookmate.member.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.kh.cookmate.member.dao.MemberDao;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

    private final MemberDao memberDao; 
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public MemberDto selectUserByNo(long userNo) {
        Member member = memberDao.selectUserByNo(userNo);
        return MemberDto.fromEntity(member);
    }

    @Override
    public List<MemberDto> getChefRanking(String filter, Long loginUserNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("filter", filter);
        params.put("loginUserNo", loginUserNo);
        return memberDao.selectChefRanking(params);
    }

    @Override
    public MemberDto getChefDetail(long chefNo, Long loginUserNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("chefNo", chefNo);
        params.put("loginUserNo", loginUserNo);
        return memberDao.selectChefDetail(params);
    }

    @Override
    @Transactional
    public boolean toggleFollow(long loginUserNo, String targetEmail) {
        Map<String, Object> params = new HashMap<>();
        params.put("loginUserNo", loginUserNo);
        params.put("targetEmail", targetEmail);

        if (memberDao.checkFollow(params) > 0) {
            memberDao.deleteFollow(params);
            return false;
        } else {
            memberDao.insertFollow(params);
            return true;
        }
    }
    
    @Override
    public MemberDto getMemberStats(long userNo) {
        return memberDao.getMemberStats(userNo); 
    }

    @Override
    public List<RecipeDto> selectMyRecipes(Map<String, Object> params) {
        return memberDao.selectMyRecipes(params); 
    }

    @Override
    public List<RecipeDto> selectMyScraps(Map<String, Object> params) {
        return memberDao.selectMyScraps(params); 
    }

    @Override
    public List<InquiryDto> selectMyInquiries(long userNo) {
        return memberDao.selectMyInquiries(userNo); 
    }


    @Override
    public int withdrawMember(long userNo) {
        return memberDao.withdrawMember(userNo); 
    }
    
    @Override
    public InquiryDto selectInquiryDetail(long inquiryNo) {
        return memberDao.selectInquiryDetail(inquiryNo);
    }

    @Override
    @Transactional
    public int insertInquiry(InquiryDto inquiryDto) {
        return memberDao.insertInquiry(inquiryDto);
    }

    @Override
    @Transactional
    public int deleteInquiry(long inquiryNo) {
        return memberDao.deleteInquiry(inquiryNo);
    }
    
    @Override
    public List<Map<String, Object>> getChefRecipeComments(long chefNo) {
        return memberDao.selectChefRecipeComments(chefNo);
    }
    
    @Override
    public int updateInquiry(InquiryDto inquiryDto) {
        return memberDao.updateInquiry(inquiryDto);
    }
    
    @Override
    public List<String> selectUserAllergies(long userNo) {
        return memberDao.selectUserAllergies(userNo);
    }

    @Override
    @Transactional // 🌟 중요: 전체 수정을 하나의 트랜잭션으로 관리
    public void updateProfile(MemberUpdateDto updateDto) {
        // 1. 기본 프로필 정보 업데이트 (MEMBER 테이블)
        int profileResult = memberDao.updateMemberProfile(updateDto);
        if (profileResult == 0) throw new RuntimeException("프로필 수정 실패");

        // 2. 새 비밀번호가 있는 경우에만 처리 (USER_CREDENTIALS 테이블)
        if (updateDto.getNewPassword() != null && !updateDto.getNewPassword().isEmpty()) {
            String encodedPw = passwordEncoder.encode(updateDto.getNewPassword());
            memberDao.updateMemberPassword(updateDto.getUserNo(), encodedPw);
            log.info("유저번호 {}의 비밀번호가 변경되었습니다.", updateDto.getUserNo());
        }

        // 3. 알레르기 정보 업데이트 (USER_ALLERGIES 테이블 등)
        // 기존 알레르기 싹 지우고 새로 입력하는 방식이 가장 안전합니다.
        memberDao.deleteMemberAllergies(updateDto.getUserNo());
        
        List<String> allergies = updateDto.getAllergies();
        if (allergies != null && !allergies.isEmpty()) {
            for (String allergyName : allergies) {
            	memberDao.insertMemberAllergy(updateDto.getUserNo(), allergyName);
            }
        }
    }
    
    @Override
    public boolean verifyPassword(long userNo, String rawPassword) {
        // 1. DB에서 해당 유저의 비밀번호를 가져옴 (이 값은 $2a$10$... 형태여야 함)
        String dbPassword = memberDao.selectPassword(userNo);
        
        if (dbPassword == null) {
            return false;
        }

        // 🌟 2. BCrypt 전용 비교 메서드 사용
        // 첫 번째 인자: 사용자가 입력한 평문 ("1234")
        // 두 번째 인자: DB에 저장된 암호화된 문자열 ("$2a$10$...")
        return passwordEncoder.matches(rawPassword, dbPassword);
    }
    
    @Override
    public String withdrawKakaoUser(long userNo, String accessToken) {
        // 1. 카카오 '연결 끊기' API 주소
        String reqURL = "https://kapi.kakao.com/v1/user/unlink";
        
        // 2. HTTP 헤더 세팅: 프론트에서 받은 엑세스 토큰을 넣습니다.
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken); 

        // 3. 헤더를 담은 HTTP 요청 객체 생성 (Body는 비어있음)
        HttpEntity<String> request = new HttpEntity<>(headers);
        RestTemplate restTemplate = new RestTemplate();
        
        try {
            // 4. 카카오 서버로 POST 요청 쏘기!
            ResponseEntity<String> response = restTemplate.exchange(
                    reqURL, HttpMethod.POST, request, String.class);
            
            // 5. 응답 코드가 200번대(성공)라면 우리 DB에서도 탈퇴 처리!
            if (response.getStatusCode().is2xxSuccessful()) {
                int result = memberDao.withdrawMember(userNo);
                return result > 0 ? "SUCCESS" : "FAIL";
            }
            
        } catch (HttpClientErrorException e) {
            // 🚨 카카오가 에러를 뱉었을 때 (특히 토큰 만료!)
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                System.out.println("⚠️ 카카오 엑세스 토큰 만료 (401)");
                return "TOKEN_EXPIRED"; 
            }
            System.err.println("❌ 카카오 API 호출 에러: " + e.getMessage());
        } catch (Exception e) {
            // 기타 서버 통신 에러 등
            System.err.println("❌ 서버 내부 에러: " + e.getMessage());
        }
        
        return "FAIL";
    }
}