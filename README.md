# Obsidian DB Grid

## Назначение

Набор компонентов позволяет реализовать картотеку записей с обложками, вывести записи в виде сетки с возможностью фильтрации и сортировки.

<img src="/images/card-list.jpg" width="45%" hspace="8"><img src="/images/card.jpg" width="45%" hspace="8">

## Функционал

- Карточка записи с обложкой на одной линии со свойствами.
- Каталог записей с обложками с возможностью сортировки и фильтрации
- Три вида оформления обложек - с обложкой (смасштабированная или вписанная) и без

### Используемые дополнения

- Dataview - в настройках плагина необходимо включить опции `Enable inline queries` и `Enable JavaScript queries`, они находится в разделе `Настройки (Шестерёнка)` -> `Сторонние плагины` -> `Dataview` -> `Оформление`

> [!NOTE]
> Оформление картотеки совместимо с темой Minimal, с остальными темами тоже будет работать, но возможны визуальные нестыковки с темой

## Установка

Все файлы необходимо разместить внутри хранилища Obsidian, в котором будут содержаться заметки каталога.

#### scripts

Содержимое папки `scripts` можно поместить в любую папку/подпапку/корень хранилища. Для примера создадим в хранилище папку `Макросы` и положим файл туда.

#### snippets

Содержимое папки `snippets` необходимо разместить в подпапке `\.obsidian\snippets` вашего хранилища. После этого в Obsidian необходимо перейти в `Настройки (Шестерёнка)` -> `Оформление`, промотать в самый низ страницы и включить элементы под заголовком `Фрагменты CSS кода`.

#### templates

Содержимое папки `templates` необходимо разместить в папке с шаблонами. Это специальная папка в Obsidian, местоположение которой назначается в настройках: `Настройки (Шестерёнка)` -> `Шаблоны` -> `Путь к папке с шаблонами`.

## Создание картотеки

### Создание заметки каталога

Заметку каталога необходимо создать первой так как записи каталога будут на неё ссылаться. Место размещения заметки каталога и карточек не принципиально. После создания заметки каталога на нём нужно применить шаблон "`Каталог`".

### Создание шаблона карточки

Поскольку для организации каталога подразумевается создание некоторого количества однотипных записей, удобно создать шаблон для этих записей. Такой шаблон необходимо разместить в папке шаблонов и применить на нём шаблон `Карточка каталога`, после чего провести настройку:

- В атрибуте `Категория` необходимо указать ссылку на заметку-каталог. Т.е. если в предыдущем пункте была создана заметка "Фильмы", то в атрибуте необходимо прописать `[[Фильмы]]`.
- Можно добавить атрибуты, которые будут использоваться в каждой заметке, выводиться в картотеке, по ним будет проводиться фильтрация и сортировка.
- Можно добавить снизу текстовые блоки для заполнения.

### Настройка визуального стиля

Карточка и картотека имеют три режима вывода обложек. Если у вас обложки с разным соотношением сторон, по умолчанию для их красивого вывода формируется прямоугольный белый блок.

Если же у вас обложки с одинаковым соотношением сторон, например постеры к фильмам, то можно убрать белый фон, добавив к атрибуту `cssclasses` значение `db-cards-list-transparent` для картотеки и `db-card-transparent` для карточки.

Если вы хотите чтобы изображения целиком заполняли предназначенный для них блок, добавьте к атрибуту `cssclasses` значение `db-cards-list-cover` для картотеки и `db-card-cover` для карточки.

Вы можете включить отображение границ карточек в картотеке, добавив к атрибуту `cssclasses` значение `db-cards-list-bordered`

### Создание заметки карточки

После указанных выше действий можно создавать заметки - карточки картотеки, на основе созданного в предыдущем пункте шаблона.

Для того чтобы в карточке и картотеке появилась обложка, необходимо вставить ссылку на файл картинки в атрибут `cover`. Ссылка на файл картинки должна быть wiki формата т.е. вида `[[image.jpg]]`. Внешние ссылки не поддерживаются.

### Настройка интерфейса картотеки

По умолчанию картотека выводит элемент управления сортировкой по названию а также сетку карточек с обложкой и названием заметки.

Код, генерирующий каталог, выглядит следующим образом:

````
```dataviewjs

const catalogGeneratorOptions = {
	container: this.container,
};

const scriptContent = await app.vault.adapter.read('\\Макросы\\db-cards-list.js');
eval(scriptContent);
```
````

Если вы положили файл скрипта в другую папку, измените путь `\\Макросы\\db-cards-list.js` соответствующим образом.

Настроить вывод можно дописывая значения в `catalogGeneratorOptions`.

#### Добавление полей для сортировки

````
const catalogGeneratorOptions = {
	container: this.container,
	sortFields: ["Рейтинг", "Год"],
};
````

#### Добавление полей фильтрации

````
const catalogGeneratorOptions = {
	container: this.container,
	filters: {
		"Рейтинг": "or",
		"Жанры": "and",
		"Год": "or",
	}
};
````

- "or" означает, что при выборе нескольких значений фильтра заметка выведется если хоть одно из этих значений есть в атрибуте заметки.
- "and" означает, что при выборе нескольких значений фильтра заметка выведется если все выбранные значения есть в атрибуте заметки.

#### Добавление полей, которые будут выведены в записи под обложкой и названием

````
const catalogGeneratorOptions = {
	container: this.container,
	columns: ["Рейтинг", "Статус", "Жанры", "Год"],
};
````

#### Управление отображением фильтров

Списки фильтров могут быть длинными и занимать много места, поэтому существует возможность сворачивать фильтры.

````
const catalogGeneratorOptions = {
	container: this.container,
	filters: {
		"Рейтинг": "or",
		"Жанры": "and",
		"Год": "or",
	},
	visibleFilterLimit: 1,
};
````

- 0 (значение по умолчанию) - все фильтры свёрнуты, есть кнопка для их раскрытия
- -1 - все фильтры видны всегда
- 1 и более - всегда видно указанное число фильтров, остальные свёрнуты и могут быть раскрыты кнопкой

#### Текстовая подпись для кнопки сортировки по названию заметки

По умолчанию кнопка имеет подпись "Название", но возможно вы захотите сменить подпись, например на "ФИО", если у вас каталог - это список людей.

````
const catalogGeneratorOptions = {
	container: this.container,
	noteNameForSort: "ФИО",
};
````

#### Название атрибута, связывающего заметки

В шаблонах и скрипте генерации каталога связующим атрибутом между каталогом и его записями является поле `Категория`. Т.е. скрипт ищет в заметках в этом поле ссылку на свою страницу, и если находит, считает что заметка принадлежит каталогу.

Вы можете переопределить это поле:

````
const catalogGeneratorOptions = {
	container: this.container,
	catalogPropertyName: "Коллекция",
};
````

#### Управление отображением подписей аттрибутов

````
const catalogGeneratorOptions = {
	container: this.container,
	columns: ["Рейтинг", "Статус", "Жанры", "Год"],
	labelMode: 'columns',
};
````

- line (значение по умолчанию) - подписи и значения примыкают друг к другу
- column - подписи и значения расположены в одну колонку
- columns - подписи и значения расположены в две колонки
- hidden - подписи не выводятся, как в версии 1.0

<img src="/images/label_1_line.jpg" width="23%" hspace="8"><img src="/images/label_2_column.jpg" width="23%" hspace="8"><img src="/images/label_3_columns.jpg" width="23%" hspace="8"><img src="/images/label_4_hidden.jpg" width="23%" hspace="8">

### Отключение вывода обложек

````
const catalogGeneratorOptions = {
	container: this.container,
	noCovers: true,
};
````

### Примечания

- атрибуты `cover` и `cssclasses` видны только в режиме редактирования заметки.

## История версий

### 1.2

#### Исправления

- В анонсе было указано "По умолчанию включён вывод подписей атрибутов", однако по умолчанию они продолжали скрываться
- Шаблон карточки теперь не выдаёт ошибки при отсутствии обложки

#### Новый функционал

- В сетке элемент без обложки теперь отображается с отступом вместо неё
- Добавлен режим отображения обложек с покрытием всей области под обложку
- Добавлен режим вывода границ элементов
- Добавлен режим вывода сетки не предусматривающий обложки

#### Изменения

- Скругления границ приведены к единому значению

### 1.1

#### Исправления

- Исправлен порядок сортировки когда есть заметка с неуказанным свойством
- Устранено мерцание при перерисовке сетки

#### Новый функционал

- Добавлена возможность выводить подписи атрибутов
- В режиме вывода только значений аттрибутов подпись аттрибута выводится в подсказке при наведении на значение

#### Изменения

- По умолчанию включён вывод подписей атрибутов
- Стиль аттрибутов и их подписей в сетке соответствует системному стилю для атрибутов

### 1.0

- Релиз
