@echo off
chcp 65001 >nul
echo ========================================
echo   超级石头剪刀布游戏打包脚本
echo ========================================
echo.
echo 正在打包项目为可执行JAR...
echo.

mvn clean package

echo.
if exist target\super-rps-0.0.1-SNAPSHOT.jar (
    echo ========================================
    echo 打包成功！
    echo ========================================
    echo.
    echo JAR文件位置: target\super-rps-0.0.1-SNAPSHOT.jar
    echo.
    echo 运行方式:
    echo java -jar target\super-rps-0.0.1-SNAPSHOT.jar
    echo.
) else (
    echo ========================================
    echo 打包失败！请检查错误信息
    echo ========================================
    echo.
)

pause

