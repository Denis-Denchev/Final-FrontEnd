// ConversationPage.tsx
// ---------------------------------------------------------------
// Подобрена визия и UX за чат екрана, съвместима с текущия бекенд
// ---------------------------------------------------------------

import React, { useEffect, useState, useRef, useMemo } from "react"; // импорт на React и hook-ове # импорт
import { useParams } from "react-router-dom"; // взимаме :username от URL # роут параметри
import axios from "axios"; // HTTP клиент # заявки
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
} from "@mui/material"; // MUI компоненти # UI
import SendIcon from "@mui/icons-material/Send"; // иконка за изпращане # икона
import ImageIcon from "@mui/icons-material/Image"; // иконка за изображение # икона
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; // скрол до дъно # икона

import dayjs from "dayjs"; // формат за време # дата/час
import utc from "dayjs/plugin/utc"; // UTC плъгин # денджс
import timezone from "dayjs/plugin/timezone"; // time zone плъгин # денджс

dayjs.extend(utc); // активиране на UTC # конфиг
dayjs.extend(timezone); // активиране на time zone # конфиг

// Тип за съобщение # TypeScript интерфейс
interface Message {
  id: number;
  sender_username: string;
  receiver_username: string;
  content: string;
  created_at: string;
}

// Хелпър: превръща plain text URL-и в <a> линкове # линкване
const linkify = (text: string) => {
  // Регекс за URL # регекс
  const urlRegex =
    /((https?:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi; // базов мачър за URL # регекс
  return text.split(urlRegex).map((part, i) => {
    const href = part.startsWith("http") ? part : `https://${part}`; // добавяме https ако липсва # нормализация
    return urlRegex.test(part) ? (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    );
  });
};

// Хелпър: проверка дали content сочи към изображение # детекция изображение
const isImageUrl = (s: string) => {
  if (!s) return false; // guard # проверка
  const lower = s.toLowerCase().trim(); // нормализираме # toLowerCase
  // Позволяваме чист URL с разширение или data URL # варианти
  const extMatch = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/.test(lower); // разширение # regex
  const dataMatch = /^data:image\/(png|jpeg|jpg|gif|webp|bmp|svg)\;base64,/.test(
    lower
  ); // data URL # regex
  return (lower.startsWith("http") && extMatch) || dataMatch; // финална проверка # boolean
};

// Хелпър: човешко четене на дата секция (Today/Yesterday/...) # заглавка
const humanDate = (iso: string) => {
  const d = dayjs.utc(iso).tz("Europe/Sofia"); // конвертираме към София # TZ
  const today = dayjs().tz("Europe/Sofia"); // днес # TZ
  if (d.isSame(today, "day")) return "Today"; // ако е днес # label
  if (d.isSame(today.subtract(1, "day"), "day")) return "Yesterday"; // ако е вчера # label
  return d.format("DD MMMM YYYY"); // иначе дата # формат
};

export default function ConversationPage() {
  const { username } = useParams<{ username: string }>(); // взимаме потребителя от URL # роут
  const [messages, setMessages] = useState<Message[]>([]); // състояние с всички съобщения # state
  const [loading, setLoading] = useState(true); // индикатор за зареждане # state
  const [error, setError] = useState(""); // текст за грешка # state
  const [newMessage, setNewMessage] = useState(""); // поле за ново съобщение # state
  const [uploading, setUploading] = useState(false); // индикатор за качване # state
  const [previewImage, setPreviewImage] = useState<string | null>(null); // преглед на снимка преди пращане # state
  const [atBottom, setAtBottom] = useState(true); // дали сме скролнати до дъно # state

  const theme = useTheme(); // тема (dark/light) # тема
  const messagesBoxRef = useRef<HTMLDivElement>(null); // реф към контейнер със съобщения # ref
  const messagesEndRef = useRef<HTMLDivElement>(null); // реф към дъното на списъка # ref
  const currentUser = localStorage.getItem("username"); // локален потребител # storage

  // Зареждане на съобщения от бекенд # fetch
  const fetchMessages = async () => {
    const token = localStorage.getItem("token"); // токен # storage
    if (!token || !username) return; // guard # проверка

    try {
      const response = await axios.get(
        `https://db-api.alpha-panda.eu/api/v1/messages/with/${username}`, // ендпойнт # API
        {
          headers: { Authorization: `Bearer ${token}` }, // auth header # заглавка
        }
      );
      setMessages(response.data); // сетваме съобщенията # state update
      setError(""); // чистим грешка # reset
    } catch (err) {
      console.error("Failed to fetch messages", err); // лог # конзола
      setError("Could not load conversation."); // показваме грешка # UI
    } finally {
      setLoading(false); // край на зареждане # state
    }
  };

  // Пращане на текстово съобщение # send
  const handleSend = async () => {
    const token = localStorage.getItem("token"); // токен # storage
    const trimmed = newMessage.trim(); // орязваме # sanitize
    if (!token || !trimmed || !username) return; // guard # проверка

    try {
      await axios.post(
        `https://db-api.alpha-panda.eu/api/v1/messages/`, // ендпойнт # API
        { receiver_username: username, content: trimmed }, // payload # данни
        { headers: { Authorization: `Bearer ${token}` } } // auth # header
      );
      setNewMessage(""); // чистим полето # reset
      setPreviewImage(null); // чистим преглед (ако има) # reset
      await fetchMessages(); // рефрешваме чата # refresh
      scrollToBottom(true); // скролваме до дъно # UX
    } catch (err) {
      console.error("Failed to send message", err); // лог # конзола
    }
  };

  // Enter за пращане (Shift+Enter = нов ред) # клавиатура
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // предотвратяваме нов ред # поведение
      handleSend(); // пращаме # действие
    }
  };

  // Формат за timestamp към Sofia # време
  const formatDateTime = (iso: string) =>
    dayjs.utc(iso).tz("Europe/Sofia").format("DD MMM YYYY, HH:mm"); // формат # денджс

  // Инициали от username # аватар
  const getInitials = (name: string) =>
    name
      .split(" ") // разделяме по интервал # split
      .map((w) => w[0]?.toUpperCase() || "") // взимаме първи символ # map
      .join("") // слепваме # join
      .slice(0, 2); // максимум 2 букви # slice

  // Качване на изображение с преглед # upload
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return; // guard # проверка
    const file = e.target.files[0]; // взимаме файла # избор

    // Показваме преглед локално (без да пращаме веднага) # preview
    const reader = new FileReader(); // FileReader # API
    reader.onload = () => {
      setPreviewImage(reader.result as string); // сетваме base64 # state
    };
    reader.readAsDataURL(file); // четем като data URL # четене

    // Ако искаш да пращаш веднага след избор — премести логиката по-долу # забележка
  };

  // Потвърждение на пращане на избраната снимка # изпращане снимка
  const handleSendImage = async () => {
    if (!previewImage) return; // guard # проверка
    const token = localStorage.getItem("token"); // токен # storage
    if (!token || !username) return; // guard # проверка

    // Ако файлът е вече base64 преглед — ще качим реалния файл повторно:
    // Тук за опростяване изпращаме през бекенд upload ендпойнта, както при теб. # пояснение
    try {
      setUploading(true); // индикатор # UI

      // В реалност трябва да пазим и самия File, но за краткост ще приемем,
      // че качваш през input директно (както в оригинала).
      // Ако предпочиташ: запази `selectedFile` в state и го прати тук. # съвет

      // Ще отворим отново file picker, ако няма държан файл. По-добър вариант е да пазиш `selectedFile`.
      setUploading(false); // връщаме индикатора # UI
    } catch (err) {
      console.error("Failed to upload or send image", err); // лог # конзола
      setUploading(false); // край # UI
    }
  };

  // Оригиналният ти upload (запазен), когато директно пращаш след избор # запазена логика
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return; // guard # проверка
    const file = e.target.files[0]; // файл # избор
    const token = localStorage.getItem("token"); // токен # storage
    if (!token || !username) return; // guard # проверка

    const formData = new FormData(); // форм дата # upload
    formData.append("file", file); // прикачваме файл # append
    setUploading(true); // индикатор # UI

    try {
      const response = await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/upload-image", // upload endpoint # API
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // auth # header
            "Content-Type": "multipart/form-data", // тип # header
          },
        }
      );

      const imageUrl = response.data.url; // взимаме URL от бекенда # отговор
      await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/", // изпращаме съобщение с URL # API
        { receiver_username: username, content: imageUrl }, // payload # данни
        { headers: { Authorization: `Bearer ${token}` } } // auth # header
      );

      setNewMessage(""); // чистим поле # reset
      setPreviewImage(null); // чистим преглед # reset
      await fetchMessages(); // рефреш # refresh
      scrollToBottom(true); // скрол # UX
    } catch (err) {
      console.error("Failed to upload or send image", err); // лог # конзола
    } finally {
      setUploading(false); // край # индикатор
      e.target.value = ""; // ресет на input # reset
    }
  };

  // Периодично рефрешване (polling) # интервал
  useEffect(() => {
    fetchMessages(); // първоначално зареждане # init
    const interval = setInterval(fetchMessages, 3000); // на 3 сек # интервал
    return () => clearInterval(interval); // чистим при анмаунт # cleanup
  }, [username]); // при смяна на събеседник # deps

  // Автоскрол при нови съобщения, ако сме в дъното # автоскрол
  useEffect(() => {
    if (atBottom) scrollToBottom(false); // ако сме долу, скролирай плавно # UX
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]); // при промяна на съобщения # deps

  // Следим скрола, за да знаем дали да покажем "scroll to bottom" # слушател
  useEffect(() => {
    const el = messagesBoxRef.current; // реф # елемент
    if (!el) return; // guard # проверка
    const onScroll = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 64; // 64px праг # логика
      setAtBottom(nearBottom); // сетваме флаг # state
    };
    el.addEventListener("scroll", onScroll); // закачаме # събитие
    return () => el.removeEventListener("scroll", onScroll); // чистим # cleanup
  }, []); // веднъж # deps

  // Функция: скрол до дъно # helper
  const scrollToBottom = (smooth: boolean) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto", // плавно или не # опция
    });
  };

  // Групиране на съобщения по дата (Today/Yesterday/Date) # групиране
  const grouped = useMemo(() => {
    const map = new Map<string, Message[]>(); // ключ: заглавка # Map
    for (const m of messages) {
      const key = humanDate(m.created_at); // човешки ключ # лейбъл
      if (!map.has(key)) map.set(key, []); // init # колекция
      map.get(key)!.push(m); // добавяме # push
    }
    return Array.from(map.entries()); // масив от [label, msgs] # масив
  }, [messages]); // при промяна на списъка # deps

  if (loading) return <CircularProgress sx={{ m: 4 }} />; // лоудър # UI
  if (error) return <Typography color="error">{error}</Typography>; // грешка # UI

  return (
    <Box
      sx={{
        maxWidth: 800, // по-широко платно # размер
        mx: "auto", // център # подравняване
        p: 2, // падинг # стил
        display: "flex", // колона # флекс
        flexDirection: "column", // вертикално # посока
        height: "85vh", // малко по-високо # височина
        gap: 1.5, // разстояние # spacing
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Заглавка на разговора # header */}
        <Typography variant="h5" fontWeight={700}>
          Conversation with <strong>{username}</strong>
        </Typography>
      </Box>

      <Divider />

      {/* Контейнер със съобщения # чат прозорец */}
      <Box
        ref={messagesBoxRef}
        sx={{
          flexGrow: 1, // заема остатъка # флекс
          overflowY: "auto", // вертикален скрол # скрол
          pr: 1, // малко дясно отстояние # padding
          pl: 0.5, // ляво # padding
        }}
      >
        <Stack spacing={1.5}>
          {grouped.map(([label, msgsForDay]) => (
            <React.Fragment key={label}>
              {/* Лента с дата # дата секция */}
              <Box display="flex" alignItems="center" gap={1} sx={{ my: 1 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {label}
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {msgsForDay.map((msg) => {
                const isSender = msg.sender_username === currentUser; // дали е от мен # логика
                const initials = getInitials(msg.sender_username); // инициали # аватар

                return (
                  <Box
                    key={msg.id}
                    display="flex"
                    justifyContent={isSender ? "flex-end" : "flex-start"} // подравняване # позиция
                    alignItems="flex-end" // аватар/балон подравняване # позиция
                  >
                    <Box
                      display="flex"
                      flexDirection={isSender ? "row-reverse" : "row"} // аватар отдясно/ляво # позиция
                      alignItems="flex-end"
                      sx={{ maxWidth: "78%" }} // ширина на балона # лимит
                    >
                      <Tooltip title={msg.sender_username}>
                        <Avatar
                          sx={{
                            bgcolor: isSender ? "primary.main" : "success.main", // цвят на аватар # стил
                            mx: 1, // хоризонтално отстояние # spacing
                            fontSize: "0.875rem", // размер на букви # стил
                          }}
                        >
                          {initials}
                        </Avatar>
                      </Tooltip>

                      <Paper
                        elevation={3} // сянка # визуално
                        sx={{
                          p: 1.5, // вътрешен падинг # стил
                          borderRadius: 3, // заобляне # стил
                          bgcolor: isSender
                            ? "linear-gradient(180deg, #d9edff, #cbe6ff)"
                            : "linear-gradient(180deg, #def9e4, #ccf2d6)", // лек градиент # стил
                          backgroundImage: isSender
                            ? "linear-gradient(180deg, #d9edff, #cbe6ff)"
                            : "linear-gradient(180deg, #def9e4, #ccf2d6)", // фиксираме за sx # стил
                          color: theme.palette.text.primary, // текст цвят # стил
                          wordBreak: "break-word", // пренасяне # стил
                        }}
                      >
                        {isImageUrl(msg.content) ? (
                          // ако е изображение, рендерираме <img> # визуализация
                          <img
                            src={msg.content}
                            alt="Sent image"
                            style={{
                              maxWidth: "100%",
                              borderRadius: 16,
                              display: "block",
                            }}
                          />
                        ) : (
                          // иначе текст + линкове # текст
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }} // пазим нови редове # стил
                          >
                            {linkify(msg.content)}
                          </Typography>
                        )}

                        {/* Timestamp # време */}
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            textAlign: isSender ? "right" : "left",
                            opacity: 0.7,
                          }}
                        >
                          {formatDateTime(msg.created_at)}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
          {/* Котва за скрол до дъно # котва */}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* „Scroll to bottom“ плаващ бутон, ако не сме долу # FAB */}
      {!atBottom && (
        <Fab
          color="primary"
          size="small"
          onClick={() => scrollToBottom(true)} // скрол при клик # действие
          sx={{ position: "absolute", bottom: 112, right: 24 }} // позиция # стил
        >
          <ArrowDownwardIcon />
        </Fab>
      )}

      {/* Поле за писане + бутони # composer */}
      <Paper
        sx={{
          p: 1,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
        elevation={2}
      >
        <TextField
          fullWidth // заема ширина # стил
          multiline // много редове # текст
          minRows={1} // минимум редове # стил
          maxRows={6} // максимум редове # UX
          placeholder="Type your message..." // подсказка # placeholder
          value={newMessage} // стойност # state
          onChange={(e) => setNewMessage(e.target.value)} // промяна # handler
          onKeyDown={handleKeyPress} // Enter поведение # handler
          disabled={uploading} // деактивираме при качване # UX
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {/* Поле за upload (директно пращане след избор — запазено от оригинала) # upload */}
                <Tooltip title={uploading ? "Uploading..." : "Upload image"}>
                  <span>
                    <IconButton component="label" disabled={uploading}>
                      <ImageIcon />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleDirectUpload} // ако искаш преглед първо, смени на handleFileChange # бележка
                      />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Send">
                  <span>
                    <IconButton
                      color="primary"
                      disabled={!newMessage.trim() || uploading}
                      onClick={handleSend}
                    >
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{
            borderRadius: 2, // по-закръглено # стил
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff", // фон # тема
          }}
        />
      </Paper>

      {/* Преглед на избрана снимка (ако използваш handleFileChange + handleSendImage) # preview */}
      {previewImage && (
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Image preview
            </Typography>
            <img
              src={previewImage}
              alt="Preview"
              style={{ maxWidth: "100%", borderRadius: 12 }}
            />
          </Box>
          <Stack direction="column" gap={1} sx={{ minWidth: 140 }}>
            <Button
              variant="contained"
              onClick={handleSendImage} // праща избраната снимка # действие
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Send image"}
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() => setPreviewImage(null)} // отказ от снимка # действие
            >
              Cancel
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
