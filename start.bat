@echo off
chcp 65001 >nul
echo ========================================
echo   超级石头剪刀布游戏启动脚本
echo   请访问 http://localhost:8081 访问游戏
echo ========================================
echo.
echo 正在启动项目...
echo.

mvn spring-boot:run

pause

