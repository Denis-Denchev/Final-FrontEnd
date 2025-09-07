// ConversationPage.tsx
// ---------------------------------------------------------------
// Подобрен чат UI: ясно подравняване (ти вдясно, получател вляво),
// по-добри мехурчета, стабилна детекция на изображения,
// кликаеми линкове, авто-скрол и "scroll to bottom" бутон.
// ---------------------------------------------------------------

import React, { useEffect, useMemo, useRef, useState } from "react"; // React и hook-ове // импорт
import { useParams } from "react-router-dom"; // взимаме :username от URL // роутинг
import axios from "axios"; // HTTP клиент // заявки
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  useTheme,
  TextField,
  Button,
  Stack,
  Avatar,
  IconButton,
  InputAdornment,
  Tooltip,
  Fab,
} from "@mui/material"; // MUI компоненти // UI
import SendIcon from "@mui/icons-material/Send"; // иконка за изпращане // икони
import ImageIcon from "@mui/icons-material/Image"; // иконка за изображение // икони
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; // скрол до дъно // икони

import dayjs from "dayjs"; // библиотека за време // дати
import utc from "dayjs/plugin/utc"; // UTC плъгин // dayjs
import timezone from "dayjs/plugin/timezone"; // time zone плъгин // dayjs

dayjs.extend(utc); // активиране UTC // конфиг
dayjs.extend(timezone); // активиране TZ // конфиг

// Тип за съобщение // TypeScript интерфейс
interface Message {
  id: number;
  sender_username: string;
  receiver_username: string;
  content: string;
  created_at: string;
}

// Хелпър: прави URL-и кликаеми // линкове
const linkify = (text: string) => {
  const urlRegex =
    /((https?:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi; // базов regex за URL // regex
  return text.split(urlRegex).map((part, i) => {
    const looksLikeUrl = urlRegex.test(part); // проверка // логика
    if (!looksLikeUrl) return <React.Fragment key={i}>{part}</React.Fragment>; // не е URL // рендер
    const href = part.startsWith("http") ? part : `https://${part}`; // нормализиране // https
    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ); // рендер на линк // рендер
  });
};

// Хелпър: детекция дали content е изображение (URL или data:) // изображения
const isImageUrl = (s: string) => {
  if (!s) return false; // guard // защита
  const lower = s.toLowerCase().trim(); // нормализираме // текст
  const dataMatch = /^data:image\/(png|jpe?g|gif|webp|bmp|svg);base64,/.test(lower); // data URL // regex
  const extMatch =
    lower.startsWith("http") &&
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(lower); // http(s) с разширение // regex
  return dataMatch || extMatch; // финална проверка // резултат
};

// Хелпър: човешка дата за секции (Today/Yesterday/дата) // дати
const humanDate = (iso: string) => {
  const d = dayjs.utc(iso).tz("Europe/Sofia"); // конвертираме към София // TZ
  const today = dayjs().tz("Europe/Sofia"); // днес // TZ
  if (d.isSame(today, "day")) return "Today"; // ако е днес // етикет
  if (d.isSame(today.subtract(1, "day"), "day")) return "Yesterday"; // ако е вчера // етикет
  return d.format("DD MMMM YYYY"); // иначе пълна дата // формат
};

// Хелпър: инициали за аватар // визия
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => (w[0] ? w[0].toUpperCase() : ""))
    .join("")
    .slice(0, 2); // максимум 2 букви // ограничение

export default function ConversationPage() {
  const { username } = useParams<{ username: string }>(); // получател от URL // роутинг
  const [messages, setMessages] = useState<Message[]>([]); // всички съобщения // state
  const [loading, setLoading] = useState(true); // индикатор за зареждане // state
  const [error, setError] = useState(""); // текст за грешка // state
  const [newMessage, setNewMessage] = useState(""); // поле за писане // state
  const [uploading, setUploading] = useState(false); // индикатор за качване // state
  const [atBottom, setAtBottom] = useState(true); // дали сме скролнати до дъно // state

  const theme = useTheme(); // тема (dark/light) // тема
  const isDark = theme.palette.mode === "dark"; // флаг за тъмен режим // тема
  const messagesBoxRef = useRef<HTMLDivElement>(null); // контейнер със съобщения // ref
  const messagesEndRef = useRef<HTMLDivElement>(null); // котва за скрол до дъно // ref

  const currentUser =
    (localStorage.getItem("username") || "").trim().toLowerCase(); // взимаме текущия потребител и нормализираме // auth

  // Зареждане на съобщения от бекенда // fetch
  const fetchMessages = async () => {
    const token = localStorage.getItem("token"); // токен // storage
    if (!token || !username) return; // guard // защита

    try {
      const res = await axios.get(
        `https://db-api.alpha-panda.eu/api/v1/messages/with/${username}`, // endpoint // API
        { headers: { Authorization: `Bearer ${token}` } } // auth header // API
      );
      setMessages(res.data); // сетваме данните // state
      setError(""); // чистим грешка // UI
    } catch (err) {
      console.error("Failed to fetch messages", err); // лог // debug
      setError("Could not load conversation."); // показваме грешка // UI
    } finally {
      setLoading(false); // край на зареждането // state
    }
  };

  // Пращане на текстово съобщение // изпращане
  const handleSend = async () => {
    const token = localStorage.getItem("token"); // токен // storage
    const trimmed = newMessage.trim(); // орязваме празни // текст
    if (!token || !trimmed || !username) return; // guard // защита

    try {
      await axios.post(
        `https://db-api.alpha-panda.eu/api/v1/messages/`, // endpoint // API
        { receiver_username: username, content: trimmed }, // payload // данни
        { headers: { Authorization: `Bearer ${token}` } } // auth // API
      );
      setNewMessage(""); // чистим полето // UX
      await fetchMessages(); // рефреш на списъка // обновяване
      scrollToBottom(true); // скролваме до дъно // UX
    } catch (err) {
      console.error("Failed to send message", err); // лог // debug
    }
  };

  // Enter праща, Shift+Enter прави нов ред // UX
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // спираме нов ред // поведение
      handleSend(); // пращаме // действие
    }
  };

  // Качване на изображение: директно пращане след избор (както при теб) // upload
  const handleDirectUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return; // guard // защита
    const file = e.target.files[0]; // файл // избор
    const token = localStorage.getItem("token"); // токен // storage
    if (!token || !username) return; // guard // защита

    const formData = new FormData(); // форм-данни // upload
    formData.append("file", file); // прикачваме файла // upload
    setUploading(true); // показваме индикатор // UX

    try {
      const uploadRes = await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/upload-image", // upload endpoint // API
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // auth // API
            "Content-Type": "multipart/form-data", // тип // API
          },
        }
      );
      const imageUrl = uploadRes.data.url; // URL от бекенда // данни

      await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/", // изпращаме съобщение с URL // API
        { receiver_username: username, content: imageUrl }, // payload // данни
        { headers: { Authorization: `Bearer ${token}` } } // auth // API
      );

      await fetchMessages(); // рефреш // обновяване
      scrollToBottom(true); // скрол до дъно // UX
    } catch (err) {
      console.error("Failed to upload or send image", err); // лог // debug
    } finally {
      setUploading(false); // спираме индикатора // UX
      e.target.value = ""; // ресетваме input-а // UI
    }
  };

  // Периодично обновяване (polling) // синхронизация
  useEffect(() => {
    fetchMessages(); // първоначално зареждане // init
    const interval = setInterval(fetchMessages, 3000); // рефреш на 3 сек // интервал
    return () => clearInterval(interval); // чистим интервала // cleanup
  }, [username]); // при смяна на събеседник // deps

  // Следене на скрола: показваме/скриваме "scroll to bottom" // UX
  useEffect(() => {
    const el = messagesBoxRef.current; // DOM елемент // ref
    if (!el) return; // guard // защита
    const onScroll = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 64; // праг 64px // логика
      setAtBottom(nearBottom); // сетваме флага // state
    };
    el.addEventListener("scroll", onScroll); // закачаме слушател // DOM
    return () => el.removeEventListener("scroll", onScroll); // махаме слушател // cleanup
  }, []); // само веднъж // deps

  // Функция: скрол до дъното // helper
  const scrollToBottom = (smooth: boolean) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto", // плавно или не // опция
    });
  };

  // Автоскрол при нови съобщения, ако вече сме долу // UX
  useEffect(() => {
    if (atBottom) scrollToBottom(false); // ако сме долу — скрол // UX
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]); // при промяна на списъка // deps

  // Групиране по ден (Today/Yesterday/Date) за ленти-разделители // четимост
  const grouped = useMemo(() => {
    const map = new Map<string, Message[]>(); // key: етикет // структура
    for (const m of messages) {
      const key = humanDate(m.created_at); // етикет на деня // изчисление
      if (!map.has(key)) map.set(key, []); // init масив // структура
      map.get(key)!.push(m); // добавяме съобщението // push
    }
    return Array.from(map.entries()); // към масив // резултат
  }, [messages]); // при промяна // deps

  // Форматиране на време към София // дати
  const formatDateTime = (iso: string) =>
    dayjs.utc(iso).tz("Europe/Sofia").format("DD MMM YYYY, HH:mm"); // формат // дати

  if (loading) return <CircularProgress sx={{ m: 4 }} />; // лоудър // UI
  if (error) return <Typography color="error">{error}</Typography>; // грешка // UI

  return (
    <Box
      sx={{
        maxWidth: 800, // ширина на платното // стил
        mx: "auto", // център // стил
        p: 2, // падинг // стил
        display: "flex", // флекс контейнер // стил
        flexDirection: "column", // вертикално подреждане // стил
        height: "85vh", // височина на изгледа // стил
        gap: 1.5, // разстояние между секции // стил
      }}
    >
      {/* Заглавка */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={700}>
          Conversation with <strong>{username}</strong>
        </Typography>
      </Box>

      <Divider />

      {/* Чат прозорец */}
      <Box
        ref={messagesBoxRef} // реф към контейнера // ref
        sx={{
          flexGrow: 1, // запълва наличното // флекс
          overflowY: "auto", // вертикален скрол // скрол
          pr: 1, // малък вътрешен десен падинг // стил
          pl: 0.5, // ляв падинг // стил
        }}
      >
        <Stack spacing={1.5}>
          {grouped.map(([label, msgsForDay]) => (
            <React.Fragment key={label}>
              {/* Лента с дата */}
              <Box display="flex" alignItems="center" gap={1} sx={{ my: 1 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {label}
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {msgsForDay.map((msg) => {
                const isSender =
                  (msg.sender_username || "").trim().toLowerCase() ===
                  currentUser; // ти ли си изпращачът // логика

                return (
                  <Box
                    key={msg.id} // ключ за елемента // React
                    display="flex" // редово подреждане // флекс
                    justifyContent={
                      isSender ? "flex-end" : "flex-start"
                    } // ти вдясно, получател вляво // подравняване
                    alignItems="flex-end" // по долна линия // подравняване
                    sx={{ width: "100%" }} // ширина на реда // стил
                  >
                    <Box
                      display="flex" // контейнер за аватар + мехур // флекс
                      flexDirection={isSender ? "row-reverse" : "row"} // аватар отдясно при теб // флекс
                      alignItems="flex-end" // подравняване // флекс
                      sx={{ maxWidth: "72%" }} // ограничаваме ширината на мехура // стил
                    >
                      <Avatar
                        sx={{
                          bgcolor: isSender
                            ? "primary.main"
                            : "success.main", // различен фон // стил
                          mx: 1, // хоризонтален отстъп // стил
                          fontSize: "0.875rem", // размер на текста в аватара // стил
                        }}
                      >
                        {getInitials(msg.sender_username) /* инициали */}
                      </Avatar>

                      <Paper
                        elevation={3} // сянка // стил
                        sx={{
                          p: 1.25, // вътрешен падинг // стил
                          borderRadius: 3, // заобляне // стил
                          // различна форма на горните ъгли за „хвостче“
                          borderTopLeftRadius: isSender ? 12 : 4, // хвостче при получателя // стил
                          borderTopRightRadius: isSender ? 4 : 12, // хвостче при теб // стил
                          color: "#000", // цвят на текста // стил
                          wordBreak: "break-word", // пренасяне на дълги думи // стил
                          background:
                            isSender
                              ? isDark
                                ? "linear-gradient(180deg,#294b63,#24465e)" // тъмен синкав при теб // фон
                                : "linear-gradient(180deg,#d9edff,#cbe6ff)" // светъл синкав при теб // фон
                              : isDark
                              ? "linear-gradient(180deg,#2b4e33,#25472d)" // тъмен зеленкав при получателя // фон
                              : "linear-gradient(180deg,#def9e4,#ccf2d6)", // светъл зеленкав при получателя // фон
                        }}
                      >
                        {/* Съдържание: изображение или текст */}
                        {isImageUrl(msg.content) ? (
                          <img
                            src={msg.content} // URL на снимката // данни
                            alt="Sent image" // алт текст // достъпност
                            style={{
                              maxWidth: "100%",
                              borderRadius: 12,
                              display: "block",
                            }} // стил за изображението // стил
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }} // пазим нови редове // стил
                          >
                            {linkify(msg.content) /* кликаеми линкове */}
                          </Typography>
                        )}

                        {/* Време */}
                        <Typography
                          variant="caption" // по-малък текст // стил
                          sx={{
                            display: "block",
                            mt: 0.5,
                            textAlign: isSender ? "right" : "left", // при теб вдясно // стил
                            opacity: 0.7,
                          }}
                        >
                          {formatDateTime(msg.created_at) /* формат */}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} /> {/* котва за скрол до дъно */}
        </Stack>
      </Box>

      {/* FAB: показва се, ако не сме долу */}
      {!atBottom && (
        <Fab
          color="primary"
          size="small"
          onClick={() => scrollToBottom(true)} // скрол при клик // действие
          sx={{ position: "absolute", bottom: 112, right: 24 }} // позиция // стил
        >
          <ArrowDownwardIcon />
        </Fab>
      )}

      {/* Composer: поле за писане + бутони */}
      <Paper
        sx={{
          p: 1, // падинг // стил
          borderRadius: 3, // заобляне // стил
          display: "flex", // флекс // стил
          alignItems: "center", // подравняване // стил
          gap: 1, // разстояние // стил
        }}
        elevation={2}
      >
        <TextField
          fullWidth // ширина // стил
          multiline // много редове // UI
          minRows={1} // минимум редове // UI
          maxRows={6} // максимум редове // UI
          placeholder="Type your message..." // placeholder // UX
          value={newMessage} // стойност // state
          onChange={(e) => setNewMessage(e.target.value)} // промяна // handler
          onKeyDown={handleKeyPress} // Enter/Shift+Enter // handler
          disabled={uploading} // докато качваш // UX
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {/* Бутон за качване на снимка (директно пращане след избор) */}
                <Tooltip title={uploading ? "Uploading..." : "Upload image"}>
                  <span>
                    <IconButton component="label" disabled={uploading}>
                      <ImageIcon />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleDirectUpload} // upload + send // handler
                      />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Бутон за изпращане */}
                <Tooltip title="Send">
                  <span>
                    <IconButton
                      color="primary"
                      disabled={!newMessage.trim() || uploading} // неактивен ако празно // UX
                      onClick={handleSend} // пращане // действие
                    >
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{
            borderRadius: 2, // заобляне // стил
            bgcolor: isDark ? "#1e1e1e" : "#fff", // фон според тема // стил
          }}
        />

        {/* Алтернативен бутон SEND — ако предпочиташ отделен бутон */}
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!newMessage.trim() || uploading}
          sx={{ display: { xs: "none", sm: "inline-flex" } }} // скрий на мобилен ако пречи // адаптация
        >
          Send
        </Button>
      </Paper>
    </Box>
  );
}
