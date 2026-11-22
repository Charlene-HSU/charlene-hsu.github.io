---
title: 醫學資訊管理師一個禮拜速通心得
date: "2026-11-22"
description: 考前一週才開始準備醫學資訊管理師：從借書、挑章節到刷歷屆試題，以及我和 ChatGPT 一起整理的考點筆記。
tags:
  - medical-informatics
  - study-notes
  - fju
  - university
---

## 醫學資訊管理師 / 分析師 簡介

醫學資訊管理師與醫學資訊分析師是**台灣醫學資訊學會**辦理的認證考試，分成兩個等級：

- **管理師**：入門的那一張。考 50 題選擇題，範圍橫跨醫療資訊標準（HL7、FHIR、DICOM、ICD）、資料庫、醫院網路、資訊安全與隱私、系統分析與維護，以及門診、急診、住院、藥局、病歷等醫院資訊系統，另外還有一塊**常用醫護術語**。
- **分析師**：進階的那一張。要先通過管理師，或已經有醫學資訊相關系所的碩、博士學位才能報考，題型為申論題。

> [!NOTE]
> 報名時間、考試科目和及格標準每年可能調整，請以學會官網最新的考試簡章為準。

---

## 如何不到五天準備考試

聰明如我欸，考前一個禮拜才開始把這個檢定當一回事，連《醫學資訊管理學》都放到長灰塵 XD

言歸正傳，以下從**參考書怎麼取得**、**該讀哪些章節**、**刷題**三個面向來分享。不過先提醒一句：**考前一週才開始準備絕對不是好事，還是奉勸大家提早準備。**

### 1. 借書：《醫學資訊管理學》與《常用醫護術語》

**醫學資訊管理學**：這本書圖書館通常都有，但不知道為什麼，稍微觀望一下就全被借走了，所以奉勸大家先搶先贏。

**常用醫護術語**：一般圖書館比較少收這本，有館藏的也不多。如果你是大學生，可以問問醫學系的同學，他們學校的圖書館有沒有；真的借不到，其他介紹醫護術語的書籍其實也可以。

### 2. 該讀哪些章節

時間不多的話，建議只讀常考的章節；常用醫護術語則基本上把字根、字首、字尾背好就夠了。

我把 13 份歷屆試卷、650 題逐題分類，做成一份[歷屆考點分析](/zh-TW/blog/medical-informatics-past-exam-analysis/)，可以看到哪些概念出現在 5 份以上的試卷、哪些只出現過一次。下面的「題數／份數」就是從這份分析統計出來的。

**醫學資訊管理學常考章節**（章節參考自《醫學資訊管理師／分析師考題分析與彙編》）：

| 章節                                                                                         | 讀的時候抓什麼                         | 題數／份數   |
| -------------------------------------------------------------------------------------------- | -------------------------------------- | ------------ |
| [第五章 醫療資訊標準](/zh-TW/blog/medical-informatics-ch05-standards/)                       | ICD、DRGs、SNOMED CT、LOINC 各自的用途 | 76 題／13 份 |
| [第六章 醫療資訊資料庫管理系統](/zh-TW/blog/medical-informatics-ch06-database/)              | 主外鍵完整性、ACID、DBMS、三層綱要     | 40 題／13 份 |
| [第七章 醫院網路規劃](/zh-TW/blog/medical-informatics-ch07-network/)                         | 網路架構與規劃原則                     | 16 題／11 份 |
| [第九章 醫療資訊隱私保障技術](/zh-TW/blog/medical-informatics-ch09-privacy/)                 | 隱私資料中心、MPC、健保資料二次利用    | 39 題／13 份 |
| [第十章 資訊系統分析](/zh-TW/blog/medical-informatics-ch10-system-analysis/)                 | 系統分析的流程與方法                   | 3 題／3 份   |
| [第十三章 資訊系統維護](/zh-TW/blog/medical-informatics-ch13-maintenance/)                   | 矯正、適應、完善、預防四類維護         | 10 題／10 份 |
| [第十五章 急診醫令系統](/zh-TW/blog/medical-informatics-ch15-emergency-orders/)              | 急診作業流程                           | 3 題／3 份   |
| [第十六章 病歷資訊管理系統](/zh-TW/blog/medical-informatics-ch16-medical-records/)           | 病歷管理與簽章時限                     | 18 題／10 份 |
| [第十八章 藥局、藥庫及藥物資訊系統](/zh-TW/blog/medical-informatics-ch18-pharmacy/)          | 藥局與藥庫的作業                       | 15 題／13 份 |
| [第二十二章 診間醫令系統](/zh-TW/blog/medical-informatics-ch22-outpatient-orders/)           | 門診醫令的流程                         | 5 題／3 份   |
| [第二十三章 住院醫令系統及臨床路徑](/zh-TW/blog/medical-informatics-ch23-clinical-pathways/) | 臨床路徑的定義與目的                   | 11 題／6 份  |
| [第二十五章 疾病監測與資訊科技](/zh-TW/blog/medical-informatics-ch25-surveillance/)          | 監測系統的用途                         | 10 題／8 份  |
| [第二十六章 電子病歷](/zh-TW/blog/medical-informatics-ch26-electronic-records/)              | 電子病歷的規範與效益                   | 31 題／12 份 |
| [第三十二章 健康資訊產業整合](/zh-TW/blog/medical-informatics-ch32-ihe/)                     | IHE 目標、Actor／Transaction、XDS.b    | 25 題／12 份 |

**常用醫護術語常考範圍**（依歷屆 104 道醫護術語題的選項整理）：

| 範圍                                                                                   | 讀的時候抓什麼                                         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [字首、字根與字尾的歷屆詞族](/zh-TW/blog/medical-terminology-01-word-parts/)           | -itis、-algia、-osis；oste/o、arthr/o、myel/o          |
| [心血管、呼吸、血液免疫與腺體](/zh-TW/blog/medical-terminology-02-cardio-respiratory/) | atrial／ventricular；pneumothorax／pyothorax           |
| [消化、腫瘤與全身症狀](/zh-TW/blog/medical-terminology-03-digestive-oncology/)         | gastric／duodenal；nausea／vomiting／diarrhea          |
| [骨科、神經、眼耳鼻與皮膚](/zh-TW/blog/medical-terminology-04-ortho-neuro-sensory/)    | osteotomy／osteoarthritis／osteoporosis／osteomyelitis |
| [婦產、生殖與泌尿器官](/zh-TW/blog/medical-terminology-05-obstetrics-urology/)         | uterine／vaginal／umbilical；gestational／postpartum   |
| [精神心理與注意力障礙](/zh-TW/blog/medical-terminology-06-psychiatry/)                 | ADHD／PTSD／OCD；anxiety／anorexia                     |
| [檢查處置、病歷、醫囑與檢體](/zh-TW/blog/medical-terminology-07-exams-orders/)         | -scopy／-scopic；CABG／ACLS；PRN／STAT／DC             |
| [拼字問題與干擾選項辨識](/zh-TW/blog/medical-terminology-08-distractors/)              | COPD、ADHD、GDM、PCR 的替換干擾                        |

### 3. 大量題目練習與歷屆試題

讀完一輪後，建議先用模擬試題測自己。範圍可以抓兩到三個章節，請 AI 幫你出題，這是鞏固小範圍知識很好的方式。錯的題目不要只記答案，而是回到筆記找出哪個概念沒弄清楚，再把那一組比較表重看一次。

接下來就是刷歷屆試題。歷屆試題**非常、非常、非常重要**，你會發現同樣的題目一直出。說白一點，直接背歷屆試題也有可能過。

> [!TIP]
> 時間很趕的話，至少做到這三件事：看完每章的「考前先讀」、刷歷屆試題、把醫護術語的常見字首字尾背起來。

---

## 我跟 ChatGPT 共同製作的筆記

這次的筆記是我和 ChatGPT 一起完成的，也都開放給所有人閱讀。

AI 很適合做「整理」和「統計」這種量大又重複的工作，但如果只叫 AI 生成，是絕對學不到東西的，所以每一份我都會自己再調整過一遍。

整理好的筆記都放在部落格上：

- [醫資管師考點版筆記總覽](/zh-TW/blog/medical-informatics-notes/)：14 章考點筆記的入口，每章都有「考前先讀」和「考點優先順序」。
- [歷屆考點分析](/zh-TW/blog/medical-informatics-past-exam-analysis/)：13 份試卷、650 題的考點頻率與出題變化。
- [歷屆醫護術語拆解](/zh-TW/blog/medical-terminology-overview/)：歷屆 104 道醫護術語題的所有選項，拆成字首、字根與字尾，並整理干擾選項。
