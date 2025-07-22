```plaintext
   ORG 0000H
   SJMP MAIN
   ORG 0003H
   LJMP INT0_HANDLER        ; 外部中断0响应函数
   ORG 001BH
   LJMP TIMER1_ISR          ;定时器1中断服务程序

cDisplayBit    EQU 2CH   ; 当前显示位
count          EQU 2DH   ; 计时器临时计数（5ms * 200 = 1秒）
cache          EQU 2EH   ; 1 秒内轮子脉冲计数，cache+1/2为距离增加临时值，cache+3/4为价格增加临时值

bcd            EQU 40H   ; 最终显示的bcd值，
bcdBuf         EQU 46H   ; bcd译码后的值，3位
result         EQU 49H   ; 速度计算结果

cDisplayBuffer EQU 50H   ; 显示缓冲区，6字节bcd -> 12个数码管段码
TR_FLAG        BIT 00H    ;SETB TR_FLAG → 告诉主程序“有新数据要处理”
MARK           BIT 01H    ;

MAIN:
   MOV cache,#00H
   MOV count,#00H
   MOV TMOD,#10H         ;设置定时器1为模式1（16位）
   MOV TH1,#0DCH        
   MOV TL1,#00H          ;加载初值 0DC00H -> 实现 5ms 中断    机器周期 = 1 / (22.1184MHz ÷ 12) ≈ 0.5425 μs    (65536 - x) * 0.5425μs = 5ms     
   SETB EA               ;中断允许总控制                                                                                 x = 56320 = 0DC00H
   SETB    IT0              ;外部中断0为边沿触发                                     ┌──────────────┐   
   SETB    EX0              ;外部中断0中断                                          │ TR_FLAG = 1? │?─────────┐（外部中断 SETB TR_FLAG）
   SETB ET1              ;开定时器1中断                                             └─────┬────────┘
   SETB TR1              ;启动定时器1                                                     │Yes                        No
   LCALL CCLR            ;清空可位寻址RAM区域                                              ▼                           │
M1:                      ;                                                            行程累加                        │
   JNB TR_FLAG,M2       ;TR_FLAG为0，就跳到M2                                           价格累加                        │                 
   LCALL UPDATE_PATH      ;TR_FLAG为1，有新脉冲，增加距离                                 清除标志                        │
   LCALL UPDATE_PRICE     ;有新脉冲，计算价格                                               ▼                           ▼
   CLR TR_FLAG            ;清除标志                                                    刷新显示（SHOW）           刷新显示（SHOW）
M2:                       ;                                                              ▼                           ▼ 
   LCALL SHOW             ;                                                            count == 200?（1秒）？ ──? 否：回 M1
   MOV    A,count   ;5ms定时，计200次为1秒                                                 │
   XRL    A,#200          ;                                                              ▼
   JNZ    M1         ;说明没到1s，就跳转回M1；否则A=0，就顺序执行下一条指令                   计算速度
   LCALL CALC_SPEED     ;累计到1s，就计算速度                                            清空计数器
   MOV    count,#0      ;重新计算1s                                                     回 M1
   MOV    cache,#0      ;清除 1 秒内轮子脉冲计数（速度置零）
   SJMP    M1           ;死循环

INT0_HANDLER:              ;外部中断0（INT0）的服务程序。外部引脚（P3.2 / INT0）发生边沿触发时，系统自动跳转执行
   JB P3.7,RESET_MARK      ;如果 P3.7 = 1，说明按钮松开，就跳转到RESET_MARK
   JB MARK,HANDLE_PULSE    ;Mark为1（第一次按下），就跳过初始化，直接进入HANDLE_PULSE累加脉冲         INT0边沿触发中断
   LCALL CCLR         ;Mark为0，清空20H - 7FH                                                        ↓
   SETB MARK          ;Mark设置为1                                                        ┌─────────────────────┐
HANDLE_PULSE:          ;                                                                 │ 判断 P3.7 是否松开？  │
   INC cache          ;每秒内收到的轮子脉冲次数，计算speed                                    └─┬───────────────┬───┘
   SETB TR_FLAG       ;                                                                    │是              │否
   RETI               ;                                                                    ▼                ▼
RESET_MARK:            ;                                                               CLR MARK         判断 MARK 是否为1？
   CLR MARK           ;                                                                    ▲             │            │
   RETI                ;                                                                   │是           │否           │是
                       ;                                                                   │             ▼             ▼
CCLR:                  ;清空内部RAM地址从 20H 开始的连续60H（20H - 7FH）                        └─────?──── CCLR（清空）  INC cache
   MOV R1,#60H         ;                                                                               SETB MARK    SETB TR_FLAG
   MOV R0,#20H    ;地址清零                                                                                           RETI
C1:                    ; 
   MOV @R0,#00H       ;
   INC R0               ;            
   DJNZ R1,C1
   RET

TIMER1_ISR:          ;定时器1的中断服务函数（5ms计时器）。一旦主程序启动，定时器1就会开始计时，每隔约5ms自动触发一次中断，跳进TIMER1_ISR执行
   MOV TH1,#0DCH    
   MOV TL1,#00H
   INC count        ;增加count
   RETI

CALC_SPEED:          ;S = X*1.83/1000 * 60 * 60 = X*6.588 (公里/小时) 
   MOV A,cache       ;将1秒内收到的脉冲数（圈数）装入A
   MOV B,#0E3H       ;                                                     假设频率是100,速度658.8km/h         
   MUL AB             ;                                                    65*100=6500
   MOV result+1,B     ;                                                    实际要为6588
   MOV B,#41H         ;                                                           差8800    88=58H  00=00H   x*64H（100D）= 5800H
   MOV A,cache        ;                                                                                                x = 0E1H  余数 = 01CH
   MUL AB             ;                                                                                                接着从0E1H开始试
   ADD A,result+1     ;  
   MOV result+1,A     ; 
   MOV A,B
   ADDC A,#0            ;进位处理操作,乘法结果拼接时的进位修正
   MOV result,A
   MOV R0,#result      ;指向16位二进制数据（result）
   MOV R1,#bcdBuf         ;指向3字节 bcd 缓冲区（bcdBuf）
   LCALL BinDec        ;输出：3字节
   MOV bcd+5,bcdBuf+2    ;将速度的低两位存入bcd+5
   MOV bcd+4,bcdBuf+1    ;
   RET
   
BinDec:               ;双字节bcd译码，老师给的，不做解释
   CLR A
   MOV @R1,A
   INC    R1
   MOV @R1,A
   INC R1
   MOV @R1,A
   PUSH 7
   MOV R7,#16
BD1:
    CLR C
    INC R0
    MOV A,@R0
    RLC A
    MOV @R0,A
    DEC R0
    MOV A,@R0
    RLC A
    MOV @R0,A
    PUSH 1
    MOV A,@R1
    ADDC A,@R1
    DA  A
    MOV @R1,A
    DEC R1
    MOV A,@R1
    ADDC A,@R1
    DA  A
    MOV @R1,A
    DEC R1
    MOV A,@R1
    ADDC A,@R1
    DA  A
    MOV @R1,A
    POP 1
    DJNZ R7,BD1
    POP 7
    RET
    
UPDATE_PATH:             ;每次增加1.83/1000 = 00.001830，依靠进位实现
   CLR C
   MOV A,#30H        ;每次轮子转动，就加上 30H
   ADDC A,cache+2    ;可能有进位
   DA A              ;确保结果是合法bcd格式
   MOV cache+2,A     
   MOV A,#18H        ;每次轮子转动，就加上 18H
   ADDC A,cache+1
   DA A
   MOV cache+1,A
   MOV A,bcd+3
   ADDC A,#0         ;运算产生的进位（C），加到 A 中去
   DA A
   MOV bcd+3,A
   MOV A,bcd+2
   ADDC A,#0
   DA A
   MOV bcd+2,A
   RET
   
UPDATE_PRICE:            ;每次00.001830*2.6 = 00.004758，依靠进位实现
   MOV A,bcd+2       ;公里数的个位
   CLR C
   SUBB A,#02H       ;判断是否大于2
   JC BASE_PRICE           ;小于2直接置8然后退出
   MOV A,#58H
   ADD A,cache+4
   DA A
   MOV cache+4,A
   MOV A,#47H
   ADDC A,cache+3
   DA A
   MOV cache+3,A   
   MOV A,#00H
   ADDC A,bcd+1
   DA A
   MOV bcd+1,A
   MOV A,#00H
   ADDC A,bcd
   DA A
   MOV bcd,A
   RET
BASE_PRICE:
   MOV bcd,#08H    ;2km内直接返回8元
   RET
   
SHOW:
   LCALL CONVERT_BCD
   LCALL Display
   RET
   
CONVERT_BCD:        
   MOV R5,#06H                   ; 共处理6个bcd字节（金额、里程、速度）
   MOV R0,#bcd                   ; 源地址：bcd起始（每字节包含两个十进制位）
   MOV R1,#cDisplayBuffer        ; 目标地址：段码索引缓冲（共12位数码管）
BCD_SPLIT:
   MOV A,@R0
   ANL A,#0F0H        ; 取高4位（bcd高位）
   SWAP A             ; 移到低位
   MOV @R1,A          ; 存入缓冲（高位）
   INC R1
   MOV A,@R0         ; 再次读取
   ANL A,#0FH        ; 取低4位
   MOV @R1,A         ; 存入缓冲（低位）
   INC R0
   INC R1
   DJNZ R5,BCD_SPLIT
   RET

DisplayTable: DB 3FH,06H,5BH,4FH,66H,6DH,7DH,07H,7FH,6FH
Display:                   ;显示程序
   MOV R5,#0CH             ; 12位数码管要扫描12次
D1: 
    LCALL Delay              ;保持显示稳定
    MOV    A, cDisplayBit    ; 当前显示位（11-0）
    MOV    P2, A              ; 输出给位选信号
    MOV    DPTR, #DisplayTable    ;DisplayTable的起始地址，加载进 DPTR
    MOV    A, #cDisplayBuffer     ;显示缓冲区地址给A
    ADD    A, cDisplayBit         ;加上当前显示位
    MOV    R0, A
    MOV    A, @R0                 ;取出当前显示位的数字
    MOVC   A, @A+DPTR             ;转换成DisplayTable中的段码
    MOV    P1, A
    INC cDisplayBit
    DJNZ R5,D1                   ;不为0，继续跳转到D1执行
    MOV cDisplayBit,#00H         ;为0，回到起点
D2:                              ; 显示结束后刷新几位，避免残影
    LCALL Delay 
    MOV    P2, #01H
    MOV    P1,#80H               ;点亮小数点
    LCALL Delay
    MOV    P2, #05H
    MOV    P1,#80H
    LCALL Delay
    MOV    P2, #0AH
    MOV    P1,#80H
    RET
Delay:                    ; 简单延时,嵌套循环
   MOV    R0,#10
   MOV    R1,#10
   DJNZ    R1,$           ;R1 减 1，不是 0，就跳到当前位置
   DJNZ    R0,$-4
   RET

END