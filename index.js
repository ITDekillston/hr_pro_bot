const { google } = require("googleapis");
//
var PathFiles = './files/';
//
const fs = require('fs');
// Главные переменные
var operator = ['411709306', true, false, {}, {}];  
//
var google_sheets = 'google_sheets.json';
//
var SeconsOperator = 60; // Сколько в секунда нельзя просить оператора 
//
// Временные данные 
var base = [];
//
var SendText;  
//
var BanUsers = [];
//
var num = 0;
//
var ConnectGoogleSheets = {
	max: 60,
	restrictions: {r: [0, (new Date().getTime()/1000)], q: []},
	connect: (d) => {
		var t = (new Date().getTime()/1000);
		//
		if(t > ConnectGoogleSheets.restrictions.r[1]) {
			ConnectGoogleSheets.restrictions.r[1] = t+(60);
			ConnectGoogleSheets.restrictions.r[0] = 0; 
		}
		//
		if(ConnectGoogleSheets.restrictions.r[0] < (ConnectGoogleSheets.max)-1 && ConnectGoogleSheets.restrictions.q.length == 0) {
			ConnectGoogleSheets.restrictions.r[0]+=1; 
			//
			ConnectGoogleSheets.sheets(d);   
		} else {
			if(ConnectGoogleSheets.launch[0] == false) {ConnectGoogleSheets.launch[0] = true;ConnectGoogleSheets.launch[1]();}
			//
			ConnectGoogleSheets.restrictions.q.push(d);
		}
	},
	launch: [false, () => {
		setTimeout(() => {
			if(ConnectGoogleSheets.restrictions.r[0] < (ConnectGoogleSheets.max)-1 && ConnectGoogleSheets.restrictions.q[0] !== undefined) {
				ConnectGoogleSheets.restrictions.r[0]+=1;
				//
				ConnectGoogleSheets.sheets(ConnectGoogleSheets.restrictions.q[0]);
				//
				ConnectGoogleSheets.restrictions.q.shift(); 
			}
			//
			ConnectGoogleSheets.launch[1](); 
		}, 100);
	}],
	sheets: (d) => {
		const auth = new google.auth.GoogleAuth({
			keyFile: google_sheets,
			scopes: "https://www.googleapis.com/auth/spreadsheets",
		});
		//
		(async () => {
			const client = await auth.getClient();
			const googleSheets = google.sheets({ version: "v4", auth: client });
			const spreadsheetId = '1DF4pvYB-4M82NmImHQ93SyVcikNp8zjtu4hFgeNwf0k';
			const data = {
				auth,
				spreadsheetId,
				valueInputOption: "USER_ENTERED",
			}
			//
			if(d.list) {
				data['range'] = d.list;
				//
				if(d.append) {
					data.resource = {values: d.append};
					//
					const a = await googleSheets.spreadsheets.values.append(data);
					//
					d.callback(a); 
				} else if(d.update) {
					data.resource = {values: d.update};
					//
					const u = await googleSheets.spreadsheets.values.update(data);
					//
					d.callback(u); 
				} else {
					delete data.valueInputOption;
					//
					const c = await googleSheets.spreadsheets.values.get(data);
					//
					d.callback(c); 
				}
			}
		})();
	}
};
//
var LoopData = {};
MessageLoopData();
function MessageLoopData() {
	ConnectGoogleSheets.connect({list: 'message_loop!A:C', callback: (d) => {
		d = d.data.values;
		//
		d.shift();
		//
		var first = false;
		//
		for(var n = 0; n < d.length; n++) {
			var e = d[n]; e.push(n);
			//
			if(first == false && TextSimi('ждёт' ,e[2]) && LoopData[n] == undefined) {
				first = e;
				LoopData[n] = true;
			}
		}
		//
		if(first !== false) {
			setTimeout(() => {
				ConnectGoogleSheets.connect({list: 'message_loop!C'+(first[3]+2), callback: (d) => {
					if(TextSimi('ждёт' ,d.data.values[0][0])) {
						ConnectGoogleSheets.connect({list: 'message_loop!C'+(first[3]+2), update: [['Отправлен']], callback: (d) => {
							//
							ConnectGoogleSheets.connect({list: 'visit!A:D', callback: (d) => {
								d = d.data.values; 
								d.shift();
								//
								d.forEach((e) => {
									if(TextSimi('Открыт', e[3])) {
										ButtonMassage(e[0], first[0], [[SendText[58][0], '/no_mailings']]); 
									}
								});
							}});
							//
							delete LoopData[first[3]]; 
						}});
					} else {
						delete LoopData[first[3]]; 
					}
				}});
			}, first[1]*60000); 
		}
		//
		setTimeout(MessageLoopData, (20)*1000)
	}});
}
//
// Функции очистки
Clean();
function Clean() {
	var seconds = new Date().getTime() / 1000; 
	//
	// Удаляет секунды проверить текст на русские символы js
	for(var n = 0; n <= base.length-1; n++) {
		// Блок удаления
		if(base[n].second < seconds) {
			delete base[n].second;
		}
		if(base[n].second_resume < seconds) {
			delete base[n].resume; delete base[n].second_resume;
		}
		// Блок очистки
		if(Object.keys(base[n]).length == 1 && base[n].id !== undefined) {
			base.splice(n, 1);
		}
	}
	//
	setTimeout(Clean, 10000);
}
//
AddTextGoogle();
function AddTextGoogle() {
	ConnectGoogleSheets.connect({list: 'send_text!A:A', callback: (d) => {
		d = d.data.values;
		//
		SendText = d;
	}});
	//
	setTimeout(AddTextGoogle, 60000);
}
//
BanUsersGoogle();
function BanUsersGoogle() {
	ConnectGoogleSheets.connect({list: 'visit', callback: (d) => {
		d = d.data.values;
		//
		var dt = [];
		for(var n = 0; n <= d.length-1; n++) {
			for(var n1 = 0; n1 <= d[n].length-1; n1++) {
				if(d[n][n1].toLowerCase() == 'закрытый') {
					dt.push(d[n][0]);
				}
			}
		}
		BanUsers = dt;
	}});
	//
	setTimeout(BanUsersGoogle, 10000);
}
//
function ResumeСheck(id, funct) {
	ConnectGoogleSheets.connect({list: 'interns!B:B', callback: (d) => {
		d = d.data.values;
		//
		for(var n = 0; n <= d.length-1; n++) {
			if(id == d[n]) {
				funct(false);
				return;
			}
		}
		funct(true);
		return;
	}});
}
//
setTimeout(MessagesWorks, 5000);
function MessagesWorks() {
	ConnectGoogleSheets.connect({list: 'workers', callback: (w) => {
		w = w.data.values;
		CSVworkersFile(w);
		//
		var d = [];
		for(var n = 1; n <= w.length-1; n++) {  
			if(w[n].length >= 8) {
				d.push(w[n][0]);
			}
		}
		d = (Array.from(new Set(d)));
		//
		ConnectGoogleSheets.connect({list: 'messages!A:A', callback: (m) => {
			m = m.data.values;
			//
			var y = [];
			//
			for(var n = 0; n <= d.length-1; n++) {
				var bool = true;
				for(var b = 0; b <= m.length-1; b++) {
					if(d[n] == m[b][0]) {
						bool = false; 
					}
				}
				if(bool) {
					y.push(d[n]); 
				}
			}
			//
			var data = []; 
			for(var n = 0; n <= y.length-1; n++) {
				ButtonMassage(y[n], SendText[44][0], [[SendText[45][0], '/data_works'], [SendText[21][0], '/call_admin']]);
				//
				data.push([y[n]]);
			}
			//
			ConnectGoogleSheets.connect({list: 'messages!A:A', append: data, callback: (d) => {}});
		}});
	}});
	//
	setTimeout(MessagesWorks, 60000);
}
//
//
//
// 5616050607:AAE8CNaCM9EP2-LknspJKdS4MkDhNoxYRCI - id оператора ?411709306? - разработчик 1884219679
var bot = new (require('node-telegram-bot-api'))('5616050607:AAE8CNaCM9EP2-LknspJKdS4MkDhNoxYRCI', {polling: true});
bot.on('message', msg => {OnMessage(msg)});
//
bot.setMyCommands([]);
//
//
function OnMessage(msg) { // Обработка входящих сообщений
	//
	if(BanCheck(msg.chat.id)) {return} // Бан  
	//
	// Перехват сообщений для общения
	if(operator[2]) {
		if(msg.chat.id == operator[0]) {
			SimulationMessage(operator[1], msg); 
			//
			return;
		} else if(msg.chat.id == operator[1]) {
			SimulationMessage(operator[0], msg);
			//
			return;
		}
	}
	//
	if(msg.chat.id == operator[0]) {MassageOperator(msg); return;}
	//
	// Перехват сообщения для резюме
	if(!(msg.chat.id == operator[0])) {
		if(!(BaseKeysReading(msg.chat.id, 'resume'))) {
			//
			BaseKeysRecord(msg.chat.id, (n) => {
				ResumeOpen(msg.chat.id, base[n]['resume'], msg.text);
			}); 
			//
			return;
		}
	} 
	//
	// Старт
	if(msg.text == '/start') { 
		ButtonMassage(msg.chat.id, SendText[0][0], [[SendText[20][0], '/further_start']]);
		//
		ConnectGoogleSheets.connect({list: 'visit!A:A', callback: (d) => {
			d = d.data.values;
			//
			for(var n = 0; n <= d.length-1; n++) { 
				if(msg.chat.id == d[n]) {
					return;
				}
			}
			//
			ConnectGoogleSheets.connect({list: 'visit', 
				append: [[msg.chat.id , ExactDate('.', '-', ':'), msg.from.first_name, 'Открытый']], 
				callback: (d) => {}
			});
		}});
	}
}
//
// Нажатие кнопок
bot.on('callback_query', msg => {
	if(BanCheck(msg.message.chat.id)) {return} // Бан
	//
	if(operator[0] == msg.message.chat.id) {OperatorCode(msg); return;}
	//
	if(msg.message.chat.id == operator[1] && operator[2]) {return};
	//
	var CallAdmin = [SendText[21][0], '/call_admin'];
	//
	// Старт
	if(msg.data == '/further_start') {
		ButtonMassage(msg.message.chat.id, SendText[1][0], [
			[SendText[22][0], '/own_resources'],
			[SendText[23][0], '/our_resources']
		]);
	}
	//
	// Ресурсы
	var YS = [[SendText[24][0], '/index_food'],[SendText[25][0], '/scooter']];
	//
	if(msg.data == '/own_resources') { // Свои ресурсы
		ButtonMassage(msg.message.chat.id, SendText[2][0], YS);
	} else if(msg.data == '/our_resources') { // Чужие ресурсы
		ButtonMassage(msg.message.chat.id, SendText[6][0], YS);
	}
	//
	// Если нажал куда он хочет работать
	var work = [[SendText[26][0], '/get_access']];
	if(msg.data == '/index_food') { // Яндекс еда
		ButtonMassage(msg.message.chat.id, SendText[3][0], work);
	} else if(msg.data == '/scooter') { // Самокат
		ButtonMassage(msg.message.chat.id, SendText[5][0], work);
	}
	//
	// Спрашивает вы точно хотите вписать резюме
	if(msg.data == '/get_access') {
		ButtonMassage(msg.message.chat.id, SendText[4][0], [
			[SendText[27][0], '/write_resume']
		]);
	}
	//
	// Связь с оператором
	if(msg.data == '/call_admin_connect') {
		if(!(BaseKeysReading(msg.message.chat.id, 'resume'))) {
			BaseKeysRecord(msg.message.chat.id, (n) => {
				delete base[n].resume;
			}); 
		}
		//
		if(msg.message.chat.id == operator[1]) { 
			MessageWithPhoto(msg.message.chat.id, SendText[8][0]);
			//
			var TC = (SendText[9][0]).split('*'); TC = (TC[0]+(msg.from.first_name+'('+msg.message.chat.id+')')+TC[2]);
			MessageWithPhoto(operator[0], TC);
			//
			operator[2] = true; 
		} else {
			MessageWithPhoto(msg.message.chat.id, SendText[10][0]);
		}
	} else if(msg.data == '/call_admin') {
		if(msg.message.chat.id == operator[1]) {
			MessageWithPhoto(msg.message.chat.id, SendText[11][0]);
			//
			return;
		} else {
			if(BaseKeysReading(msg.message.chat.id, 'second')) { 
				if(operator[1] == true) {
					MessageWithPhoto(msg.message.chat.id, SendText[7][0]);
					//
					var TC = (SendText[12][0]).split('*'); TC = (TC[0]+(msg.from.first_name+'('+msg.message.chat.id+')')+TC[2]);
					ButtonMassage(operator[0], TC, [['Принять', '/connectId_'+msg.message.chat.id]]);
					//
					BaseKeysRecord(msg.message.chat.id, (n) => {
						base[n]['second'] = ((new Date().getTime() / 1000)+SeconsOperator);
					}); 
				} else {
					MessageWithPhoto(msg.message.chat.id, SendText[18][0]); 
					//
					operator[4][msg.message.chat.id] = [((new Date().getTime() / 1000)+600), msg.from.first_name];
				}
			} else { 
				MessageWithPhoto(msg.message.chat.id, SendText[19][0]);
			}
		}
	}
	//
	// Вписывание резюме
	if(msg.data == '/write_resume') {
		ResumeСheck(msg.message.chat.id, (b) => {
			if(b) {
				BaseKeysRecord(msg.message.chat.id, (n) => {
					base[n]['resume'] = {full_name: true, city: true, mail: true, phone: true, cooperation: true};
					base[n]['second_resume'] = ((new Date().getTime() / 1000)+600);
					//
					MessageWithPhoto(msg.message.chat.id, SendText[28][0]);
				});
			} else {
				ButtonMassage(msg.message.chat.id, SendText[43][0], [[SendText[21][0], '/call_admin']]);
			}
		}) 
	} else if(TextSimi('/resources_resume', msg.data)) {
		if(!(BaseKeysReading(msg.message.chat.id, 'resume'))) {
			//
			BaseKeysRecord(msg.message.chat.id, (n) => {
				if(base[n]['resume'].cooperation !== true) {
					MessageWithPhoto(msg.message.chat.id, SendText[29][0]);
				}
				if(base[n]['resume'].phone == true) { 
					ButtonMassage(msg.message.chat.id, SendText[30][0], [[SendText[27][0], '/write_resume']]);
				} else {
					if(msg.data == '/resources_resume_i') {
						base[n]['resume'].cooperation = SendText[22][0];
					} else if(msg.data == '/resources_resume_o') {
						base[n]['resume'].cooperation = SendText[23][0];
					}
					//
					ButtonMassage(msg.message.chat.id,  SendText[31][0], [[SendText[41][0], '/sdid'], [SendText[42][0], '/write_resume']]);
				}
			}); 
			//
			return;
		}
	} else if(msg.data == '/sdid') {
		if(!(BaseKeysReading(msg.message.chat.id, 'resume'))) {
			BaseKeysRecord(msg.message.chat.id, (n) => {
				var bool = true;
				//
				var r = base[n].resume;
				//
				var keys = Object.keys(r);
				//
				for(var n = 0; n <= keys.length-1; n++) {
					if(r[keys[n]] == true) {
						bool = false;
					}
				}
				//
				if(bool) {
					ConnectGoogleSheets.connect({list: 'interns', 
						append: [[
							(ExactDate('.', '-', ':')),
							msg.message.chat.id,
							r.full_name,
							r.city,
							r.mail,
							r.phone, 
							r.cooperation
						]], 
						callback: (d) => {
							ButtonMassage(msg.message.chat.id, SendText[54][0], [CallAdmin]);
							//
							BaseKeysRecord(msg.message.chat.id, (n) => {delete base[n].resume;}); 
						}
					});
					//
				} else {
					ButtonMassage(msg.message.chat.id, SendText[32][0], [[SendText[27][0], '/write_resume']]);
				}
			}); 
		}
	}
	if(msg.data == '/data_works') {
		if (fs.existsSync(PathFiles+msg.message.chat.id+'.csv')) {
			bot.sendDocument(msg.message.chat.id, PathFiles+msg.message.chat.id+'.csv');
		}
	} else if(msg.data == '/no_mailings') {
		ConnectGoogleSheets.connect({list: 'visit!A:A', callback: (d) => {
			d = d.data.values;
			//
			for(var n = 0; n < d.length; n++) {
				if(d[n][0] == msg.message.chat.id) {
					ConnectGoogleSheets.connect({list: 'visit!D'+(n+1), update: [['Без рассылок']], callback: (d) => {
						MessageWithPhoto(msg.message.chat.id, SendText[59][0]);
					}});
					//
					break;
				}
			}
		}});
	}
});
//
//
// Оператор
function OperatorCode(msg) {
	// Начать переписку
	if(TextSimi('/connectId', msg.data)) {
		operator[3] = {};
		//
		var stop = ['Сбросить', '/stop'];
		//
		if(operator[1] == true) {
			ButtonMassage(msg.message.chat.id, SendText[13][0], [stop]);
			//
			operator[1] = (msg.data.split('_'))[1];
			//
			ButtonMassage(operator[1], SendText[14][0], [['Принять', '/call_admin_connect']]);
			//
			return;
		}
		//
		ButtonMassage(msg.message.chat.id, SendText[15][0], [stop]);
	} else if(msg.data == '/stop') {
		MessageWithPhoto(operator[0], SendText[16][0]);
		//
		MessageWithPhoto(operator[1], SendText[17][0]);
		//
		operator[1] = true;
		//
		operator[2] = false;
		//
		//
		var keys = Object.keys(operator[4]);
		//
		var DateSecond = (new Date().getTime() / 1000);
		for(var n = 0; n <= keys.length-1; n++) {
			var person = operator[4][keys[n]];
			if(person[0] >= DateSecond) {
				//
				var TC = (SendText[12][0]).split('*'); TC = (TC[0]+(person[1]+'('+keys[n]+')')+TC[2]);
				ButtonMassage(operator[0], TC, [['Принять', '/connectId_'+keys[n]]]);
				//
			}
		}
		//
		operator[4] = {};
	} else if(msg.data == '/mailing_works') {
		operator[3] = {};
		operator[3].works = true;
		//
		MessageWithPhoto(operator[0], SendText[48][0]);
	} else if(msg.data == '/mailing_not_works') {
		operator[3] = {};
		operator[3].noworks = true;
		//
		MessageWithPhoto(operator[0], SendText[48][0]);
	} else if(msg.data == '/send_milling') {
		if(operator[3].works && operator[3].works !== true) {
			ConnectGoogleSheets.connect({list: 'messages!A:A', callback: (d) => {
				d = d.data.values;
				//
				for(var n = 1; n <= d.length-1; n++) {
					SimulationMessage(d[n][0], operator[3].works); 
				}
				//
				operator[3] = {};
				//
				MessageWithPhoto(operator[0], SendText[51][0]+'\n('+SendText[49][0]+')');
			}});
		} else if(operator[3].noworks && operator[3].noworks !== true) {
			ConnectGoogleSheets.connect({list: 'visit', callback: (visit) => {
				visit = visit.data.values;
				//
				ConnectGoogleSheets.connect({list: 'messages!A:A', callback: (messages) => {
					messages = messages.data.values;
					for(var v = 1; v <= visit.length-1; v++) {
						if(visit[v][3] == 'Открытый') {
							var bool = true;
							for(var m = 0; m <= messages.length-1; m++) {
								if(visit[v][0] == messages[m][0]) {
									bool = false;
								}
							}
							if(bool) {
								SimulationMessage(visit[v][0], operator[3].noworks);  
							}
						}
					}
					//
					operator[3] = {};
					//
					MessageWithPhoto(operator[0], SendText[51][0]+'\n('+SendText[50][0]+')');
				}});
			}});
		}
	} else if(msg.data == '/run_the_loop') {
		ConnectGoogleSheets.connect({list: 'message_loop!C:C', callback: (l) => {
			l = l.data.values;
			//
			var newData = [];
			l.forEach((e) => {
				newData.push(['Ждёт отправления']);
			});
			ConnectGoogleSheets.connect({list: 'message_loop!C:C', update: newData, callback: (d) => {
				MessageWithPhoto(operator[0], SendText[57][0]);
			}});
		}});
	}
}
//
//
function ResumeOpen(id, resume, text) {
	// Проверка фио
	if(resume.full_name == true) {
		var full_name = ((text.replace(/^\s+|\s+$/g, '')).replace(/\s{2,}/g, ' ').split(' '));
		//
		if(full_name.length == 3 && (full_name.join('')).length < 100) {
			resume.full_name = full_name.join(' ');
			//
			MessageWithPhoto(id, SendText[33][0]);
		} else {
			MessageWithPhoto(id, SendText[34][0]);
		}
	} else if(resume.city == true) {
		var city = ((text.replace(/^\s+|\s+$/g, '')).replace(/\s{2,}/g, ' ').split(' '));
		//
		if(city[0].length > 1 && (city.join('')).length < 100) {
			resume.city = city.join(' ');
			//
			MessageWithPhoto(id, SendText[35][0])
		} else {
			MessageWithPhoto(id, SendText[36][0])
		}
	} else if(resume.mail == true) {
		var mail = ((text.replace(/^\s+|\s+$/g, '')).replace(/\s{2,}/g, ' ').split(' '));
		//
		if(mail.length == 1 && TextSimi('@', mail[0]) && MailRusFalse(mail[0])) {
			resume.mail = mail.join(' ');
			//
			MessageWithPhoto(id, SendText[37][0]);
		} else {
			MessageWithPhoto(id, SendText[38][0]);
		}
	} else if(resume.phone == true) {
		var phone = ((text.replace(/^\s+|\s+$/g, '')).replace(/\s{2,}/g, ' ').split(' '));
		//
		var phoneTrue = PhoneTrue(phone[0]);
		//
		if(phone.length == 1 && phoneTrue !== false) {
			resume.phone = phoneTrue;
			//
			ButtonMassage(id, SendText[39][0], [
				[SendText[22][0], '/resources_resume_i'],
			 	[SendText[23][0], '/resources_resume_o']
			]);
		} else {
			MessageWithPhoto(id, SendText[40][0]);
		}
	}
}
//
function MassageOperator(msg) { 
	if(operator[3].works == true) {
		SimulationMessage(msg.chat.id, msg, (d) => {
			operator[3].works = d;
			//
			ButtonMassage(operator[0], SendText[52][0], [['Отправить', '/send_milling'], [SendText[50][0], '/mailing_not_works']]);
		});
	} else if(operator[3].noworks == true) {
		SimulationMessage(msg.chat.id, msg, (d) => {
			operator[3].noworks = d;
			//
			ButtonMassage(operator[0], SendText[52][0], [['Отправить', '/send_milling'], [SendText[49][0], '/mailing_works']]);
		});
	}
	if(msg.text == '/start') {
		MessageWithPhoto(msg.chat.id, SendText[46][0]);
	} else if(msg.text == '/help') {
		ButtonMassage(msg.chat.id, SendText[55][0], [
			[SendText[53][0], '/stop'], 
			[SendText[49][0], '/mailing_works'],
			[SendText[50][0], '/mailing_not_works'],
			[SendText[56][0], '/run_the_loop']
		]);
	}
}











//
//
//
//
// Функции
//
//
function CSVworkersFile(data) {
	var IdMass = {};
	//
	var CellName = data[0].join(';')+'\r\n';
	//
	for(var n = 1; n <= data.length-1; n++) {
		var DataText = (data[n].join(';')+'\r\n');
		//
		if(IdMass[data[n][0]] !== undefined) {
			IdMass[data[n][0]]+=DataText;
		} else {
			IdMass[data[n][0]] = DataText;
		}
	} 
	//
	var keys = Object.keys(IdMass);
	//
	CreateFile(0, IdMass, keys, PathFiles, CellName);
	function CreateFile(num, IdMass, keys, PathFiles, CellName) {
		fs.writeFile(PathFiles+keys[num]+'.csv',  ('\uFEFF'+CellName+IdMass[keys[num]]), 'utf8', (err) => { 
			if(num < keys.length-1) {
				CreateFile(num+1, IdMass, keys, PathFiles, CellName);
			}
		});
	}
}
//
function BaseKeysRecord(id, fun) {
	for(var n = 0; n <= base.length-1; n++) {
		if(base[n].id == id) {
			fun(n);
			//
			return;
		}
	}
	base.push({id: id});
	fun(base.length-1);
}
//
function BaseKeysReading(id, key) {
	for(var n = 0; n <= base.length-1; n++) {
		if(base[n].id == id) {
			if(base[n][key] !== undefined) {
				return false;
			}
		}
	}
	//
	return true;
}
//
var DataFileId = {};
function SimulationMessage(id, msg, callback) {
	if((msg.voice !== undefined || msg.text !== undefined) && callback !== undefined) {callback(msg); return;};
	//
	if(Array.isArray(msg)) { 
		bot.sendMediaGroup(id, msg);
		return;
	}
	//
	if(msg.voice !== undefined) {
		bot.sendVoice(id, msg.voice.file_id); 
		return;
	} else if(msg.text !== undefined) {
		bot.sendMessage(id, msg.text); 
		return;
	}
	//
	if(DataFileId[id] == undefined) {
		DataFileId[id] = [msg];
		setTimeout(() => {
			var text = false;
			//
			var data = [];
			//
			var m = DataFileId[id];
			//
			m.forEach(e => {
				if(e.caption !== undefined) {
					text = e.caption;
				}
				//
				var check = ['photo', 'document', 'video', 'audio'];
				check.forEach(c => {
					var media;
					if(e[c]) {
						if(e[c].file_id) {
							media = e[c].file_id;
						} else {
							media = e[c][0].file_id;
						}
						//
						data.push({type: c, media: media}); 
					}
				});
			});
			if(text !== false) {
				var d = data[data.length-1];
				d.caption = text;
				d.parse_mode = 'markdown';
			}
			//
			if(callback == undefined) {
				bot.sendMediaGroup(id, data);
			} else {
				callback(data);
			}
			//
			delete DataFileId[id];
		}, 100);
	} else {
		DataFileId[id].push(msg);
	}
}
//
function SetMyCommands(m) { // Функцию меню
	var mass = [];
	for(var n = 0; n <= m.length-1; n++) {
		mass.push({command: '/'+(m[n][0]), description: m[n][1]});
	}
	bot.setMyCommands(mass);
}
// 
async function ButtonMassage(id, text, m) { // Создание кнопок
	var button = [];
	for(var n = 0; n <= m.length-1; n++) {
		button.push([{text: m[n][0], callback_data: m[n][1]}]);
	}
	//
	var sp = ['{', '}'];
	//
	var ButtonMassage = {reply_markup: JSON.stringify({inline_keyboard: button})}; 
	//
	if(text.split(sp[0]).length > 1) {
		var p = text.split(sp[0])[1].split(sp[1])[0];
		//
		text = text.replace(sp[0]+p+sp[1], '');
		//
		bot.sendPhoto(id, p).then(() => {
			bot.sendMessage(id, text, ButtonMassage);
		});
	} else {
		bot.sendMessage(id, text, ButtonMassage);
	}
	//
}
//
function TextSimi(str1, str2) { // Найти текст
     if((str2.toUpperCase()).indexOf(str1.toUpperCase()) >= 0) {  
        return true;
    } else {
        return false;
    }
}
//
function PhoneTrue(phone) {
	phone = phone.replace(/\s/g, "");
	//
	var p = '';
	for(var n = 0; n <= phone.length-1; n++) {
		if(!isNaN(Number(phone[n]))) {
			p+=phone[n];
		}
	}
	//
	if(p.length == 10) {
		p = '8'+p;
	}
	//
	if(p.length == 11) {
		return p;
	} else {
		return false;
	}
}
//
function MailRusFalse(mail) {
	if(mail.length > 150) {return false};
	//
	for(var n = 0; n <= mail.length-1; n++) { 
		if((/^[а-яА-ЯёЁ\s]+$/).test(mail[n])) {
			return false
		}
	}
	return true;
}
//
function ExactDate(str1, str2, str3) {
	let data = new Date();
	//
	return (
		String(data.getDate()).padStart(2, '0')
		+str1+
		String((data.getMonth()+1)).padStart(2, '0')
		+str1+
		String(data.getFullYear()).padStart(2, '0')
		+str2+
		String(data.getHours()).padStart(2, '0')
		+str3+
		String(data.getMinutes()).padStart(2, '0')
		+str3+
		String(data.getSeconds()).padStart(2, '0')
	);
}
//
function BanCheck(id) {
	for(var n = 0; n <= BanUsers.length-1; n++) {
		if(id == BanUsers[n]) {
			return true;
		}
	}
	return false;
}
//
function MessageWithPhoto(id, text) {
	var text = text.split('{');
	//
	if(text.length == 1) {
		bot.sendMessage(id, text[0]);
	} else {
		var t = text[1].split('}');
		//
		bot.sendPhoto(id, t[0], {caption: text[0]+t[1], parse_mode : 'markdown'});
	}
}
/*
googleapis
*/
// 1 - Посмотреть как выводятся таблицы и как (исправить)
// 2 - Добавление ссылки (возможно много менять)
// 3 - Добавление цикла сообщений, научиться менять данные (новерно сделать новую функцию)

