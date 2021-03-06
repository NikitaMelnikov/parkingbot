'use strict';

const _ = require('lodash');
const config = require('../config');

const SlotsStore = require('../slots-store');

const PRIVATE_RESPONSE = [
    {
        title: 'Я рожден для работы в каналах, тут доступен только /howtopark и /slotsinfo',
        color: config.ALL_TAKEN_COLOR,
        mrkdwn_in: ['text']
    }
];

const slots = `*/setslots* – полностью перезаписать доступные места
*/addslots* – добавить доступные места 
*/removeslots* – убрать доступные места 
*/slotsinfo* – текущее состояние мест
Чтобы занять место, просто напишите в канал его номер, чтобы освободить – номер с минусом
Номер места вычисляется по регулярному выражению из цифр и точек.
Каждый день в полночь писок свободных мест обновляется.`;

const msgDefaults = {
    response_type: 'in_channel'
};

const handler = (payload, res) => {
    console.log(payload);
    if (payload.command === '/howtopark') {
        let attachments = [
            {
                title: 'Инструкция по парковке :blue_car:',
                color: config.ADD_COLOR,
                text: slots,
                mrkdwn_in: ['text']
            }
        ];
        sendMessage(payload, res, attachments);
        return;
    }

    if (payload.command === '/slotsinfo') {
        sendMessage(payload, res, [
            {
                text: 'Доступные места: ' + SlotsStore.getAllSots().join(', '),
                color: config.ADD_COLOR,
                mrkdwn_in: ['text']
            },
            {
                text: 'Свободные места: ' + SlotsStore.getFreeSots().join(', '),
                color: config.FREE_COLOR,
                mrkdwn_in: ['text']
            }
        ]);
        return;
    }

    if (payload.channel_name === 'directmessage') {
        sendMessage(payload, res, PRIVATE_RESPONSE);
        return;
    }

    switch (payload.command) {
        case '/setslots':
            SlotsStore.setSlots(payload.text);
            break;
        case '/addslots':
            SlotsStore.addSlots(payload.text);
            break;
        case '/removeslots':
            SlotsStore.removeSlots(payload.text);
            break;
    }

    sendMessage(payload, res, [
        {
            text: 'Список доступных мест обновлен: ' + SlotsStore.getAllSots().join(', '),
            color: config.ADD_COLOR,
            mrkdwn_in: ['text']
        },
        {
            text: 'Свободные места: ' + SlotsStore.getFreeSots().join(', '),
            color: config.FREE_COLOR,
            mrkdwn_in: ['text']
        }
    ]);
};

function sendMessage(payload, res, attachments) {
    let msg = _.defaults(
        {
            channel: payload.channel_name,
            attachments
        },
        msgDefaults
    );

    res.set('content-type', 'application/json');
    res.status(200).json(msg);
}

module.exports = {handler: handler, PRIVATE_RESPONSE: PRIVATE_RESPONSE};
