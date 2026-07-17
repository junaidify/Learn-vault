package learn_vault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn_vault.dto.request.payment.VerifyPaymentRequestDto;
import learn_vault.dto.response.CourseAmountResponseDto;
import learn_vault.exception.GlobalExceptionHandler;
import learn_vault.security.JwtFilters;
import learn_vault.security.JwtUtils;
import learn_vault.security.Oauth2SuccessHandler;
import learn_vault.security.SecurityConfig;
import learn_vault.service.CustomUserDetailsService;
import learn_vault.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.web.cors.CorsConfigurationSource;

@WebMvcTest(PaymentController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class, JwtFilters.class})
class PaymentControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean PaymentService paymentService;
    @MockBean JwtUtils jwtUtils;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean AuthenticationProvider authenticationProvider;
    @MockBean Oauth2SuccessHandler oauth2SuccessHandler;
    @MockBean learn_vault.repository.UserRepository userRepository;

    @org.springframework.boot.test.context.TestConfiguration
    static class TestConfig {
        @org.springframework.context.annotation.Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
            return new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        }
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void makePayment_shouldReturnOrderDto_onSuccess() throws Exception {
        CourseAmountResponseDto responseDto = new CourseAmountResponseDto(
                "order_TEST123",
                99900L,
                "INR",
                "Spring Boot"
        );

        when(paymentService.makePayment(1L)).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/payment/order/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.razorpayOrderId").value("order_TEST123"))
                .andExpect(jsonPath("$.amount").value(99900L))
                .andExpect(jsonPath("$.currency").value("INR"))
                .andExpect(jsonPath("$.courseName").value("Spring Boot"));
    }

    @Test
    void makePayment_shouldRedirectToLogin_whenUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/v1/payment/order/1")
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost/oauth2/authorization/google"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void verifyPayment_shouldReturnSuccessMessage_onSuccess() throws Exception {
        VerifyPaymentRequestDto requestDto = new VerifyPaymentRequestDto();
        requestDto.setCourseId(1L);
        requestDto.setRazorpayOrderId("order_TEST123");
        requestDto.setRazorpayPaymentId("pay_TEST123");
        requestDto.setSignature("sig_TEST123");

        when(paymentService.verifyPayment(any(VerifyPaymentRequestDto.class), any())).thenReturn("Course purchased successfully");

        mockMvc.perform(post("/api/v1/payment/verify")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Course purchased successfully"));
    }
}
