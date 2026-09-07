package com.ohsh.website;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/hello")
    public Map<String, String> hello() {

        Map<String, String> response = new HashMap<>();

        response.put("message", "Hello from Spring Boot!");
        response.put("server", "Spring Boot");
        response.put("database", "MariaDB");

        return response;
    }

    @PostMapping("/api/test")
    public Map<String, String> test(@RequestBody Map<String, String> request) {

        Map<String, String> response = new HashMap<>();

        response.put("message", "데이터 수신 성공!");
        response.put("name", request.get("name"));
        response.put("email", request.get("email"));

        return response;
    }
}