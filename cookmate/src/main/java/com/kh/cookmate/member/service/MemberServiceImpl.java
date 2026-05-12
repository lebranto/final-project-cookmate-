package com.kh.cookmate.member.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.member.dao.MemberDao;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
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
    @Transactional 
    public int updateProfile(MemberDto memberDto) {
        int result = memberDao.updateMember(memberDto);
        
        if (result > 0 && memberDto.getAllergies() != null) {
            memberDao.deleteUserAllergies(memberDto.getUserNo());
            for (String allergyName : memberDto.getAllergies()) {
                Map<String, Object> map = new HashMap<>();
                map.put("userNo", memberDto.getUserNo());
                map.put("allergyName", allergyName);
                memberDao.insertUserAllergy(map);
            }
        }
        return result;
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
    @Transactional
    public void updateProfileWithAllergies(Map<String, Object> payload) {
    	long userNo = Long.parseLong(payload.get("userNo").toString());
        
        MemberDto memberDto = new MemberDto(); 
        memberDto.setUserNo(userNo);
        memberDto.setNickname((String) payload.get("nickname"));
        memberDto.setIntroduce((String) payload.get("introduce"));
        memberDto.setProfileImageUrl((String) payload.get("profileImageUrl"));
        
        String newPassword = (String) payload.get("newPassword");
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            memberDto.setUserPw(passwordEncoder.encode(newPassword));
        }
        
        memberDao.updateMember(memberDto); 
        
        memberDao.deleteUserAllergies(userNo);
        List<String> allergies = (List<String>) payload.get("allergies");
        if (allergies != null && !allergies.isEmpty()) {
            for (String allergyName : allergies) {
                Map<String, Object> param = new HashMap<>();
                param.put("userNo", userNo);
                param.put("allergyName", allergyName);
                memberDao.insertUserAllergy(param);
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
}