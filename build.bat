@echo off
chcp 65001 >nul
echo ========================================
echo   超级石头剪刀布游戏构建脚本
echo ========================================
echo.
echo 正在清理并编译项目...
echo.

mvn clean compile

echo.
echo ========================================
echo 构建完成！
echo ========================================
echo.
echo 运行 start.bat 启动项目
echo 或执行: mvn spring-boot:run
echo.
pause

