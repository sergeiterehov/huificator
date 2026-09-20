/** Сообщения между попапом и content-скриптом. */
export type HuificatorMessage =
    | { type: "huificator:status" }
    | { type: "huificator:start" };

/** Ответ content-скрипта. */
export type HuificatorResponse = {
    /** Включён ли хуификатор в этом фрейме. */
    enabled: boolean;
    /** Был ли он уже включён до текущего сообщения. */
    already?: boolean;
};
