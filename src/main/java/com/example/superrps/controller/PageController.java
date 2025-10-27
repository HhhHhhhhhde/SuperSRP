package com.example.superrps.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 页面路由控制器
 * 负责将URL映射到相应的Thymeleaf模板
 */
@Controller
public class PageController {

    /**
     * 首页 - 玩家对战模式
     */
    @GetMapping("/")
    public String index() {
        return "index";
    }

    /**
     * 闯关模式页面
     */
    @GetMapping("/stage")
    public String stage() {
        return "stage";
    }

    /**
     * 历史对局页面
     */
    @GetMapping("/history")
    public String history() {
        return "history";
    }
}

