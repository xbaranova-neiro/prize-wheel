# Колесо призов — первый рабочий этап

Русскоязычный закрытый кабинет школы. Реализованы сохранение розыгрышей в D1, копирование, четыре типа призов, лимиты, валидация вероятностей, палитры и собственные темы, предпросмотр, ручные статусы эфира, серверные тестовые вращения, история и CSV.

## Запуск

Используйте Node 22+, `npm ci`, `npm run db:generate` после изменения схемы, `npm run build`. Логическое хранилище DB задано в `.openai/hosting.json`. Миграции находятся в drizzle. Авторизация кабинета — доверенные заголовки платформы Sites; API отклоняет запросы без пользователя. При локальной работе требуется поддерживаемое окружение платформы. Не подменяйте проверку пользователя публичными клиентскими данными.

## Ограничения этого этапа

Это не готовый к реальному эфиру сервис. Все вращения тестовые. GetCourse, внешний виджет Бизона, персональные токены, очередь выдачи, роли сотрудников, загрузки, расписание и расширенный редактор оформления ещё не реализованы. Публичный адрес нельзя заменять адресом закрытого кабинета. Статусы ручного запуска пока управляют только тестовым экраном в кабинете. Остатки при тестах не расходуются.

## Следующий этап

1. Подготовить отдельный публичный Worker для виджета и серверную проверку персональных токенов; закрытый кабинет оставить приватным.
2. Внедрить таблицы участников, попыток, запасов и очереди выдачи с уникальными ограничениями и атомарной регистрацией выигрыша.
3. Проверить официальные API GetCourse и процессы школы. Для начисления и продления использовать только подтверждённые механизмы. Секреты передавать через защищённые серверные переменные окружения.
4. Подключить подтверждение фактической выдачи. Не повторять неидемпотентные начисления при неопределённом исходе запроса.
5. Настроить регистрацию и передачу токенов через персональные ссылки. Виджет проверяет статус раз в 2 секунды и сервер повторно проверяет его при вращении.
6. Установить JS виджет в разрешённое поле HTML/JS комнаты Бизона по актуальной инструкции. Протестировать внутри реальной комнаты с видео и чатом на iOS и Android.

## Проверки

Сборка приложения и проверка SQL-миграции. Сервер тестовых вращений проверяет вероятности, использует crypto.getRandomValues, не выдаёт призы, сохраняет результат с optimistic concurrency. Конфликт ревизий возвращает 409. Полные браузерные и реальные мобильные проверки не проводились.

## Тест в Бизоне (обновление)

Добавлены /api/connection, /api/widget/:key и /test-widget.js. В разделе «Управление эфиром» владелец создаёт код для комнаты https://online.bizon365.ru/room/93864/testim. Код грузит изолированный Shadow DOM виджет с доступным dialog, номерами секторов и полными названиями призов. Статус обновляется каждые две секунды после ответа. При потере связи новые нажатия блокируются.

Тестовый результат сохраняется на сервере отдельно от реальных призов. Один browser session ID получает один результат; повторный запрос возвращает его. Кнопка «Новая тестовая попытка» явно сбрасывает идентификатор для репетиций. Это не идентификация клиента GetCourse. Запасы не расходуются. В кабинете показываются последние 100 результатов из комнаты.

Кабинет теперь проверяет владельца по доверенной платформенной email-идентичности на сервере; запросы остальных пользователей отклоняются. Виджет не получает ключи или данные клиентов. Платформенный доступ пока остаётся owner-only: до явного разрешения владельца перевести Site в public внешние зрители не смогут загрузить скрипт. После переключения публичны только скрипт и тестовые запросы по случайному ключу; кабинет дополнительно защищён собственной проверкой владельца.

Проверено: сборка, синтаксис виджета, SQL-идемпотентность повторного запроса, отклонение устаревшей ревизии и нового вращения после закрытия, сохранение предыдущего результата. Тест в настоящей комнате и мобильный browser QA не завершены: browser transport прервался. Подключение внешнего доступа и установка кода ещё нужны.

## GetCourse integration

Owner-only `/api/getcourse` stores an AES-GCM encrypted API key. Configure the
64-character hex `GC_ENCRYPTION_KEY` as a Sites secret before deployment; keep it
stable across deployments. Never rotate it without re-encrypting existing settings.
Only canonical `ACCOUNT.getcourse.ru` endpoints are accepted; redirects are blocked.

In Integrations, map every prize to a dedicated zero-cost GetCourse offer ID.
Creation of an order uses the documented Import API (`/pl/api/deals`, action `add`),
a stable `WHEEL-<award UUID>` order number, cost zero, status `new`, and
`refresh_if_exists: 0`. It does not directly call bonus or access APIs.
GetCourse offer settings and per-order processes must perform the actual grant.
References: https://getcourse.ru/help/api and https://getcourse.ru/blog/276133 .

The owner creates a personal room link for a trusted customer's email. Its token
is in the URL fragment, stored as a hash server-side, and valid for seven days.
Reissuing the link invalidates its predecessor without resetting the award.
The public widget never accepts an email or recipient ID. Ordinary room links
remain test-only. Registration webhook provisioning and email delivery of these
links are not implemented; the owner must currently create/distribute them.

A real draw atomically checks the draw state, revision, enabled mapping, current
participant token, unique participant and stock limit before saving a durable
award. A queued award is sent immediately; if execution stopped beforehand,
participant status refresh or the owner's Send action processes it. There is no
scheduled queue worker: without these requests pending jobs remain queued.
Once dispatch starts it is never blindly retried. Unknown outcomes require manual
review in GetCourse by the stable order number. API success means an order was
created, not that access or bonus rubles were granted. The owner can record actual
verification in the journal; an automated GetCourse completion callback is not
connected. API error details and secrets are never returned to public clients.

Checks: `node --test tests/getcourse.test.mjs`; `python tests/getcourse-sql.py`.
These exercise UTF-8 payloads, response validation, encryption, single dispatch,
timeout recovery, secret redaction, SQLite migrations, stock and eligibility gates.
Real integration verification requires an account API key, dedicated offer IDs,
configured GetCourse processes and a selected test customer.
