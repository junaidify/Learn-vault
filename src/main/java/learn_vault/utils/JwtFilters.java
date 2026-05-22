package learn_vault.utils;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import learn_vault.service.CustomUserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilters extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtFilters(JwtUtils jwtUtils, CustomUserDetailsService customUserDetailsService){
        this.jwtUtils = jwtUtils;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected  void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
       String token = null;
       Cookie[] cookies = request.getCookies();

       if(cookies == null){
           filterChain.doFilter(request, response);
           return;
       }

       for(Cookie cookie : cookies){
           if(cookie.getName().equals("jwt")){
               token = cookie.getValue();
           }
       }

       if(token == null){
           filterChain.doFilter(request, response);
           return;
       }

       try{
           String email = jwtUtils.extractEmail(token);

           if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
               UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
               UsernamePasswordAuthenticationToken authToken =
                       new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

               SecurityContextHolder.getContext().setAuthentication(authToken);
           }
       }catch(JwtException e) {
           response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
           return;
       }

       filterChain.doFilter(request, response);
    }

    @Override
    public boolean shouldNotFilter(HttpServletRequest request){
        return request.getServletPath().startsWith("/auth/");
    }
}
