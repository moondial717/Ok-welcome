# Readme
## Slash Commands
### `/ask` - **Query the bot 詢問機器人問題**
* Example: 
   ```
   /ask 請告訴我x-100和x-200的加工能力有何差異?
   ```
   ![截圖 2024-01-26 下午8.40.39](https://hackmd.io/_uploads/rywUdQZqa.png)
   
    ![截圖 2024-01-26 下午8.41.27](https://hackmd.io/_uploads/By_KO7ZqT.png)

* 如圖，bot會根據train結果提供訓練結果及其對應之相關來源文件檔
* **預設icon** 用途: 
    * ☑️：快速建立標籤(後續於[/tag](###Tag標籤)介紹)
    * 🔧：再問一次
    ![image](https://hackmd.io/_uploads/SkZWRHb9a.png)
    * ❌：刪除訊息
        * 從對話框刪除
         ![ezgif-7-6c63a9b665](https://hackmd.io/_uploads/B1W8e8Z9a.gif)
        * 歷史紀錄同步刪除
         ![image](https://hackmd.io/_uploads/BywcuI-ca.png)



### `/all` -  **List query histories by users 列出用戶歷史記錄**
* 在使用`/all`的時候 可以選擇`user`或`my-questions`
![截圖 2024-01-26 下午8.56.25](https://hackmd.io/_uploads/rJDZhQZ9p.png)
* Usage
    * user: 可以選擇要列出**哪一個user**的記錄
    ![截圖 2024-01-26 下午9.01.32](https://hackmd.io/_uploads/r1YVTXW5a.png)
    
        ![image](https://hackmd.io/_uploads/HkSnNrb5p.png)
        
    * my-questions: 可選擇要印出**自己**或**所有user**的紀錄
     ![image](https://hackmd.io/_uploads/B13fmBbcp.png)
        * TRUE : 印出自己的紀錄
        ![image](https://hackmd.io/_uploads/BJaKHrW9p.png)
        * FALSE : 印出所有user的紀錄
        ![image](https://hackmd.io/_uploads/Hy-KLHWqT.png)

### `tag` + `subcommand` - **Tag 標籤紀錄**
#### 新增問題標籤：`\tag add`或`\tag a`
*  ![截圖 2024-01-26 下午9.10.31](https://hackmd.io/_uploads/Hy73g4b9a.png)
![截圖 2024-01-26 下午9.11.40](https://hackmd.io/_uploads/r1WTl4Z9T.png)
* 可快速新增
    * 在bot的回應處，選擇☑️表情符號
    * ![截圖 2024-01-26 下午9.27.14](https://hackmd.io/_uploads/Bkz57N-ca.png)
    * 此時bot會在`指令`頻道回覆
    * 右鍵複製bot的訊息並貼上，自訂`name`（例如process）和`type`(例如：SOP)即可
    * ![截圖 2024-01-26 下午9.32.34](https://hackmd.io/_uploads/H1iJSVWc6.png)
* private tag 私人標籤 
    * 將`private`設為`True`可設定private tag
    * Default Setting: False（public）
    * ![截圖 2024-01-26 下午10.18.33](https://hackmd.io/_uploads/SJOwkBb56.png)


#### 顯示問題列表：`\tag show`或`\tag s`
* ![截圖 2024-01-26 下午9.42.09](https://hackmd.io/_uploads/ByJT84ZcT.png)
* 可選擇要顯示的`number`, `username`和`type`
* ![截圖 2024-01-26 下午10.11.27](https://hackmd.io/_uploads/ByOCpV-qp.png)

#### 取得問題：`\tag fetch`或`\tag f`
* ![截圖 2024-01-26 下午9.10.46](https://hackmd.io/_uploads/ryteLVbca.png)
![截圖 2024-01-26 下午9.13.33](https://hackmd.io/_uploads/BJf7LVb96.png)
* 使用方式及結果
![截圖 2024-01-26 下午9.47.36](https://hackmd.io/_uploads/HJG7O4Zqp.png)

    ![截圖 2024-01-26 下午9.48.44](https://hackmd.io/_uploads/BypSOEW5a.png)

#### 編輯問題標籤：`\tag edit`或`\tag e`
* ![截圖 2024-01-26 下午9.13.13](https://hackmd.io/_uploads/S1dMUEb5a.png)
![截圖 2024-01-26 下午9.11.56](https://hackmd.io/_uploads/H1Zz8VW5p.png)
* 使用方式及結果
* ![截圖 2024-01-26 下午9.50.42](https://hackmd.io/_uploads/Hyvp_E-5p.png)
    * 有三個選項可進行編輯（`question`, `answer`, `editname`），以下用`answer`為例
    * ![截圖 2024-01-26 下午9.54.03](https://hackmd.io/_uploads/HytKY4b9a.png)
    * 使用`/tag fetch`取得tag內容，answer已被改成123:）
    * ![截圖 2024-01-26 下午9.55.15](https://hackmd.io/_uploads/SyWAt4Z9T.png)
    * ⚠️：`/tag fetch`無法取得private tag
![截圖 2024-01-26 下午10.22.40](https://hackmd.io/_uploads/HyyBgH-cT.png)


#### 取得問題標籤資訊：`\tag info`或`\tag i`
* ![截圖 2024-01-26 下午9.13.55](https://hackmd.io/_uploads/Hk548VWqT.png)
![截圖 2024-01-26 下午9.11.02](https://hackmd.io/_uploads/HkVbINb5T.png)
* 可顯示tag的相關資訊
* ![截圖 2024-01-26 下午10.04.25](https://hackmd.io/_uploads/SkkWhV-56.png)


#### 移除問題標籤：`\tag remove`或`\tag r`
* ![截圖 2024-01-26 下午9.40.39](https://hackmd.io/_uploads/S10tUEZqa.png)![截圖 2024-01-26 下午9.40.32](https://hackmd.io/_uploads/Hyq5UN-qa.png)
* 使用方式及結果
* ![截圖 2024-01-26 下午10.26.07](https://hackmd.io/_uploads/SyrSZrZ5p.png)
* ![截圖 2024-01-26 下午10.26.57](https://hackmd.io/_uploads/SJ5r-H-cp.png)

### `/help` - **Introduce functions 功能介紹**
* Chatbot function 使用介紹
* Example : 
![image](https://hackmd.io/_uploads/rkPSUO-5p.png)

## **Upload File**
#### 直接上傳檔案
* ![gif](https://i.imgur.com/SOAcSyg.gif)

#### 上傳雲端共用連結
* ![gif](https://i.imgur.com/FIqJIAP.gif)
