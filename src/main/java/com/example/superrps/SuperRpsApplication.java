package com.example.superrps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 超级石头剪刀布 - SpringBoot 主应用程序
 * 这是一个纯前端项目，使用SpringBoot来服务静态资源和Thymeleaf模板
 */
@SpringBootApplication
public class SuperRpsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SuperRpsApplication.class, args);
        System.out.println("===========================================");
        System.out.println("超级石头剪刀布游戏已启动！");
        System.out.println("访问地址: http://localhost:8081");
        System.out.println("===========================================");
    }
}

