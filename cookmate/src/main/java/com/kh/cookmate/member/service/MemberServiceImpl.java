package com.kh.cookmate.member.service;

import java.util.ArrayList;
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
import com.kh.cookmate.member.dto.FollowDto;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.MyCommentDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;
import com.kh.cookmate.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

    private final MemberDao memberDao; 
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    
    
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
            int insertResult = memberDao.insertFollow(params);
            
            if (insertResult > 0) {
            	notificationService.notifyFollow(loginUserNo, targetEmail);
                return true; 
            } else {
                throw new IllegalStateException("탈퇴하거나 정지된 회원은 팔로우할 수 없습니다.");
            }
        }
    }
    
    @Override
    public Map<String, List<FollowDto>> getFollowList(long userNo, String filter) {
        Member me = memberDao.selectUserByNo(userNo);
        
        if (me == null) {
            Map<String, List<FollowDto>> emptyResult = new HashMap<>();
            emptyResult.put("following", new ArrayList<>());
            emptyResult.put("followers", new ArrayList<>());
            return emptyResult;
        }

        String myEmail = me.getUserEmail();

        Map<String, Object> params = new HashMap<>();
        params.put("userNo", userNo);             
        params.put("loginUserNo", userNo);       
        params.put("loginUserEmail", myEmail);   
        params.put("filter", filter);             

        List<FollowDto> following = memberDao.selectFollowingList(params);
        List<FollowDto> followers = memberDao.selectFollowerList(params);

        Map<String, List<FollowDto>> result = new HashMap<>();
        result.put("following", following);
        result.put("followers", followers);

        return result;
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
    public Map<String, List<MyCommentDto>> getCommentList(long userNo, String filter) {
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", userNo);
        params.put("filter", filter);

        List<MyCommentDto> writtenComments = memberDao.selectMyWrittenComments(params);
        
        List<MyCommentDto> receivedComments = memberDao.selectCommentsOnMyBoards(params);

        Map<String, List<MyCommentDto>> result = new HashMap<>();
        result.put("written", writtenComments);   
        result.put("received", receivedComments); 

        return result;
    }
    
    @Override
    public List<InquiryDto> selectMyInquiries(long userNo) {
        return memberDao.selectMyInquiries(userNo); 
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
    @Transactional 
    public void updateProfile(MemberUpdateDto updateDto) {
        int profileResult = memberDao.updateMemberProfile(updateDto);
        if (profileResult == 0) throw new RuntimeException("프로필 수정 실패");

        if (updateDto.getNewPassword() != null && !updateDto.getNewPassword().isEmpty()) {
            String encodedPw = passwordEncoder.encode(updateDto.getNewPassword());
            memberDao.updateMemberPassword(updateDto.getUserNo(), encodedPw);
            log.info("유저번호 {}의 비밀번호가 변경되었습니다.", updateDto.getUserNo());
        }

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
        String dbPassword = memberDao.selectPassword(userNo);
        
        if (dbPassword == null) {
            return false;
        }

        return passwordEncoder.matches(rawPassword, dbPassword);
    }
    
    @Override
    @Transactional
    public int withdrawMember(long userNo) {
    	
    	memberDao.deleteUserAuthorities(userNo);
    	memberDao.deleteUserCredentials(userNo);
    	memberDao.deleteMemberAllergies(userNo);
    	memberDao.deleteAllScraps(userNo);
    	
    	Member member = memberDao.selectUserByNo(userNo); 
        Map<String, Object> followParams = new HashMap<>();
        followParams.put("userNo", userNo);
        followParams.put("userId", member.getUserEmail()); 
        
        memberDao.deleteAllFollowing(followParams);
    	
        return memberDao.withdrawMember(userNo); 
    }
    
    @Override
    @Transactional
    public String withdrawKakaoUser(long userNo, String accessToken) {
    	
        String reqURL = "https://kapi.kakao.com/v1/user/unlink";
        
        String kakaoToken = memberDao.getKakaoAccessToken(userNo); 
        
        if (kakaoToken == null || kakaoToken.isEmpty()) {
            System.err.println("DB에 해당 유저의 토큰이 없습니다.");
            return "FAIL";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + kakaoToken); 

        HttpEntity<String> request = new HttpEntity<>(headers);
        RestTemplate restTemplate = new RestTemplate();
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    reqURL, HttpMethod.POST, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
            	
            	memberDao.deleteUserIdentity(userNo);
            	memberDao.deleteUserAuthorities(userNo); 
            	memberDao.deleteMemberAllergies(userNo);
            	memberDao.deleteAllScraps(userNo);
            	
            	Member member = memberDao.selectUserByNo(userNo);
                Map<String, Object> followParams = new HashMap<>();
                followParams.put("userNo", userNo);
                followParams.put("userId", member.getUserEmail()); 
                
                memberDao.deleteAllFollowing(followParams);
            	
                memberDao.withdrawMember(userNo);
                
                return "SUCCESS";
            }
            
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                // 토큰이 만료된 경우 이때는 재로그인 필요
                System.out.println("엑세스 토큰이 만료되었습니다 (401)");
                return "TOKEN_EXPIRED"; 
            }
            System.err.println("카카오 API 호출 에러: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("서버 내부 에러: " + e.getMessage());
        }
        
        return "FAIL";
    }
}