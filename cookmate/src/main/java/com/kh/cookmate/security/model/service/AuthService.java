package com.kh.cookmate.security.model.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.kh.cookmate.security.model.dao.AuthDao;
import com.kh.cookmate.security.model.dto.AuthDto.AuthResult;
import com.kh.cookmate.security.model.dto.AuthDto.LoginRequest;
import com.kh.cookmate.security.model.dto.AuthDto.LoginResponse;
import com.kh.cookmate.security.model.dto.AuthDto.PasswordResetRequest;
import com.kh.cookmate.security.model.dto.AuthDto.SignupRequest;
import com.kh.cookmate.security.model.dto.AuthDto.User;
import com.kh.cookmate.security.model.provider.JWTProvider;
import com.kh.cookmate.security.utils.CookieUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

	private final AuthDao authDao;
	private final PasswordEncoder encoder;
	private final Map<String, EmailCode> emailCodeStore = new ConcurrentHashMap<>();
	private final KakaoService service;
	private final JWTProvider jwt;
	private final SecureRandom secureRandom = new SecureRandom();

	public boolean existsByEmail(String email) {
		User user = authDao.findByEmail(email);
		if (user == null) {
			throw new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다.");
		}

		return true;
	}

	public AuthResult login(String email, String pw) {
		User user = authDao.findByEmail(email);
		if (user == null) {
			if (authDao.existsByEmail(email) > 0) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, "로그인 할 수 없는 계정입니다.");
			}
			throw new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다.");
		}

		if (!encoder.matches(pw, user.getUserPw())) {
			throw new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다.");
		}

		authDao.updateLastLogin(user.getUserNo());

		String accessToken = jwt.createAccessToken(user.getUserNo(), 30);
		String refreshToken = jwt.createRefreshToken(user.getUserNo(), 1);

		User userNoPassword = User.builder()
				.userNo(user.getUserNo())
				.userEmail(user.getUserEmail())
				.nickname(user.getNickname())
				.profileImageUrl(user.getProfileImageUrl())
				.introduce(user.getIntroduce())
				.address(user.getAddress())
				.roles(user.getRoles())
				.build();

		return AuthResult.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.user(userNoPassword)
				.build();
	}

	public AuthResult refreshByCookie(String refreshCookie) {
		Long userId = jwt.getUserId(refreshCookie, CookieUtil.REFRESH_COOKIE);
		User user = authDao.findUserByUserId(userId);
		String accessToken = jwt.createAccessToken(userId, 30);

		return AuthResult.builder()
				.accessToken(accessToken)
				.user(user)
				.build();
	}

	public User findUserByUserId(Long userId) {
		return authDao.findUserByUserId(userId);
	}

	public String getkakaoAccessToken(Long userId) {
		return authDao.getKakaoAccessToken(userId);
	}

	@Transactional
	public LoginResponse login2(LoginRequest req) {
		User user = authDao.findByEmail(req.getUserEmail());

		System.out.println("로그인 요청 이메일 = " + req.getUserEmail());
		System.out.println("DB 조회 결과 = " + user);

		if (user == null) {
			throw new ResponseStatusException(
					HttpStatus.UNAUTHORIZED,
					"이메일 또는 비밀번호가 일치하지 않습니다.");
		}

		System.out.println("입력 비밀번호 = " + req.getUserPw());
		System.out.println("DB 비밀번호 = " + user.getUserPw());

		boolean matches = encoder.matches(req.getUserPw(), user.getUserPw());
		System.out.println("비밀번호 일치 여부 = " + matches);

		if (!matches) {
			throw new ResponseStatusException(
					HttpStatus.UNAUTHORIZED,
					"이메일 또는 비밀번호가 일치하지 않습니다.");
		}

		authDao.updateLastLogin(user.getUserNo());
		String accessToken = "test-token";

		return LoginResponse.builder()
				.userNo(user.getUserNo())
				.userEmail(user.getUserEmail())
				.nickname(user.getNickname())
				.accessToken(accessToken)
				.build();
	}

	@Transactional
	public void signup(SignupRequest req) {
		int count = authDao.existsByEmail(req.getUserEmail());

		if (count > 0) {
			throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
		}

		String encodedPw = encoder.encode(req.getUserPw());
		req.setUserPw(encodedPw);

		authDao.insertUser(req);
		authDao.insertUserCredentials(req);
		authDao.insertAuthority(req);

		if (req.getAllergies() != null && !req.getAllergies().isEmpty()) {
			authDao.insertAllergies(req);
		}
	}

	public void sendEmailCode(String email) {
		if (!StringUtils.hasText(email)) {
			throw new IllegalArgumentException("이메일을 입력해주세요.");
		}

		String code = "123456";
		emailCodeStore.put(email, new EmailCode(code, LocalDateTime.now().plusMinutes(5)));

		// 실제 메일 발송을 다시 사용할 때는 아래 코드를 켜고, 위의 code를 랜덤 생성으로 바꾸면 됩니다.
		// String code = String.valueOf(secureRandom.nextInt(900000) + 100000);
		// emailCodeStore.put(email, new EmailCode(code, LocalDateTime.now().plusMinutes(5)));
		// try {
		// 	emailSender.sendVerificationCode(email, code);
		// } catch (MailException e) {
		// 	emailCodeStore.remove(email);
		// 	log.error("Failed to send verification email to {}", email, e);
		// 	throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "인증 메일 발송에 실패했습니다.");
		// }
	}

	public void verifyEmailCode(String email, String code) {
		EmailCode savedCode = emailCodeStore.get(email);

		if (savedCode == null || savedCode.isExpired() || !savedCode.code().equals(code)) {
			emailCodeStore.remove(email);
			throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
		}

		emailCodeStore.remove(email);
	}

	@Transactional
	public void resetPassword(PasswordResetRequest req) {
		if (!StringUtils.hasText(req.getEmail())) {
			throw new IllegalArgumentException("이메일을 입력해주세요.");
		}

		if (!isValidPassword(req.getNewPassword())) {
			throw new IllegalArgumentException("비밀번호는 8자 이상이며 영문자와 숫자를 모두 포함해야 합니다.");
		}

		int exists = authDao.existsByEmail(req.getEmail());
		if (exists == 0) {
			throw new IllegalArgumentException("가입된 이메일을 찾을 수 없습니다.");
		}

		req.setNewPassword(encoder.encode(req.getNewPassword()));

		int updated = authDao.updatePasswordByEmail(req);
		if (updated == 0) {
			throw new IllegalArgumentException("비밀번호 변경에 실패했습니다.");
		}
	}

	public AuthResult login(LoginRequest req) {
		return login(req.getUserEmail(), req.getUserPw());
	}

	private boolean isValidPassword(String password) {
		return StringUtils.hasText(password)
				&& password.length() >= 8
				&& password.matches(".*[A-Za-z].*")
				&& password.matches(".*\\d.*");
	}

	private record EmailCode(String code, LocalDateTime expiresAt) {
		private boolean isExpired() {
			return LocalDateTime.now().isAfter(expiresAt);
		}
	}

	@RequiredArgsConstructor
	static class GmailEmailSender {

		private final JavaMailSender mailSender;

		@Value("${spring.mail.username}")
		private String from;

		void sendVerificationCode(String to, String code) {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom("CookMate <" + from + ">");
			message.setTo(to);
			message.setSubject("[CookMate] 이메일 인증번호");
			message.setText("""
					CookMate 이메일 인증번호입니다.

					인증번호: %s

					인증번호는 5분 동안만 유효합니다.
					""".formatted(code));

			mailSender.send(message);
		}
	}
}
