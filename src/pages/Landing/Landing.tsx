/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-indent */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import React, { useState } from 'react';
import clsx from 'clsx';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import styles from './Landing.module.scss';
import mainAbout from '../../assets/images/main_pros/main_about.svg';
import folder from '../../assets/images/main_pros/folder.svg';
import img2 from '../../assets/images/main_pros/2.svg';
import img3 from '../../assets/images/main_pros/3.svg';
import img4 from '../../assets/images/main_pros/4.svg';
import img5 from '../../assets/images/main_pros/5.svg';
import img6 from '../../assets/images/main_pros/6.svg';
import img7 from '../../assets/images/main_pros/7.svg';
import img8 from '../../assets/images/main_pros/8.svg';
import img9 from '../../assets/images/main_pros/9.svg';
import img10 from '../../assets/images/main_pros/10.svg';
import img12 from '../../assets/images/main_pros/12.svg';
import pdf from '../../assets/images/main_pros/pdf-icon.svg';

export const Landing = () => {
    const tryOnClick = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/model/public_list';
        }
    };
    const [isShowModal, setIsShowModal] = useState(false);

    const showModal = () => {
        setIsShowModal(true);
    };
    const closeModal = () => {
        setIsShowModal(false);
    };
    const [validated, setValidated] = useState(false);

    const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else closeModal();

        setValidated(true);
    };

    return (
        <>

            <nav id="mainmenu" className="navbar navbar-expand navbar-dark" aria-label="Navbar" style={{ minWidth: '850px', backgroundColor: '#0A1744' }}>
                <div className="container">
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto" style={{ marginLeft: 'auto', justifyContent: 'space-between', width: '500px', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                            <li className="nav-item">
                                <a
                                    className="nav-link"
                                    style={{ cursor: 'pointer' }}
                                    aria-current="page"
                                    onClick={() => { document.getElementById('about_service')!.scrollIntoView(); }}
                                >
                                    О сервисе

                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => { document.getElementById('advantages')!.scrollIntoView(); }}>Преимущества</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => { document.getElementById('rates')!.scrollIntoView(); }}>Тарифы</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" style={{ cursor: 'pointer' }} aria-current="page" onClick={() => { document.getElementById('contacts')!.scrollIntoView(); }}>Контакты</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main id="page-content" role="main" className={styles.pageСontent}>
                <div className={styles.mainForm}>
                    <div className={styles.mainBack}>
                        <div className={styles.backTwoThirds}>
                            <div className={styles.headerPurple}>
                                Lottabyte
                            </div>
                            <div style={{ marginTop: '68px' }}>
                                <span className={styles.textOnBack}>
                                    Учет дата-активов
                                    <br />
                                    +
                                    <br />
                                    Управление дата-продуктами
                                    <br />
                                    =
                                    <br />
                                    Гибкое управление данными
                                </span>
                            </div>
                        </div>
                        <div className={styles.backThird}>
                            <button type="button" className={clsx(styles.btn, styles.btnPrimary)} onClick={tryOnClick}>Попробовать бесплатно</button>
                        </div>
                    </div>
                    <div>
                        <div className="row justify-content-center">
                            <form className={styles.mainPageBody}>
                                <div className={styles.header36} id="about_service">О СЕРВИСЕ</div>
                                <div style={{ display: 'flex' }}>
                                    <img className={styles.imgAbout} src={mainAbout} />
                                    <div className={styles.textAbout}>

                                        Платформа управления данными Lottabyte предназначена для гибкого управления данными компании.
                                        <br />
                                        {' '}
                                        Решение позволяет вести учет дата-активов и дата-продуктов, позволяет управлять метриками и показателями, управлять
                                        критичными элементами данных и правилами их проверок, строить цепочки ценности данных.

                                    </div>
                                </div>
                                <div className={styles.header36} id="advantages">ПРЕИМУЩЕСТВА</div>
                                <div style={{ display: 'flex', marginBottom: '45px' }}>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={folder} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Классификация
                                                {' '}
                                                <br />
                                                Определение типа активов (финансовые данные, персональные данные, техническая документация и т.д), которые должны быть учтены и поддерживаться на протяжении ЖЦ
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img2} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Построение взаимосвязанных физических и логических моделей
                                                данных

                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img3} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Стоимость дата-активов
                                                {' '}
                                                <br />
                                                Определение прямых и косвенных затрат , которые несет организация на создание, обработку, хранения и поддержку данных на протяжении всего ЖЦ

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', marginBottom: '45px' }}>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img4} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Метаданные
                                                {' '}
                                                <br />
                                                формирование информационных запросов к системам-источникам данных для получения физических метаданных для каждого дата-актива

                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img5} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Риски
                                                <br />
                                                Оценка вероятности и последствий негативных событий, связанных с данными, таких как потеря, утечка, повреждение или несанкционированный доступ

                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img6} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Качество дата-активов
                                                <br />
                                                Определение параметров пригодности активов их к использованию в бизнес-процессах или аналитических приложениях

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', marginBottom: '45px' }}>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img7} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Достоверность данных
                                                {' '}
                                                <br />
                                                {' '}
                                                соответствие данных реальности

                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img8} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Качество данных
                                                {' '}
                                                <br />
                                                {' '}
                                                соблюдение требований к данным
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img9} className={styles.prosImg} />
                                            <div className={styles.prosText}>Бережливое управление физическими метаданными</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', marginBottom: '45px' }}>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img10} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Построение цепочки ценности данных

                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img5} className={styles.prosImg} />
                                            <div className={styles.prosText}>API для работы с workflow</div>
                                        </div>
                                    </div>
                                    <div className={styles.pros}>
                                        <div style={{ display: 'flex' }}>
                                            <img src={img12} className={styles.prosImg} />
                                            <div className={styles.prosText}>
                                                Ролевая модель и сервисы безопасности с поддержкой LDAP

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.header36} id="rates">ТАРИФЫ</div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div className={styles.rates}>
                                        <div className={styles.ratesBox}>
                                            <div className={styles.ratesBoxHead}>БАЗОВЫЙ</div>
                                            <div className={styles.ratesBoxText}>Для индивидуального использования</div>
                                            <div className={styles.boxBottom}>
                                                <div className={styles.ratesBoxPrice}>Бесплатно</div>
                                                <button
                                                    type="button"
                                                    className={clsx(styles.btn, styles.btnPrimary, styles.ratesBoxBtn)}
                                                    onClick={showModal}
                                                >
                                                    Подключиться

                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.rates}>
                                        <div className={styles.ratesBox}>
                                            <div className={styles.ratesBoxHead}>РАСШИРЕННЫЙ</div>
                                            <div className={styles.ratesBoxText}>
                                                Для индивидуального использования
                                                <br />
                                                +
                                                <br />
                                                сервисная
                                                поддержка

                                            </div>
                                            <div className={styles.boxBottom}>
                                                <div className={styles.ratesBoxPrice}>100 000 руб/мес</div>
                                                <button
                                                    type="button"
                                                    className={clsx(styles.btn, styles.btnPrimary, styles.ratesBoxBtn, styles.submitApp)}
                                                    onClick={showModal}
                                                >
                                                    Подключиться

                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.rates}>
                                        <div className={styles.ratesBox}>
                                            <div className={styles.ratesBoxHead}>КОРПОРАТИВНЫЙ</div>
                                            <div className={styles.ratesBoxText}>Для юридических лиц</div>
                                            <div className={styles.boxBottom}>
                                                <div className={styles.ratesBoxPrice}>По запросу</div>
                                                <button
                                                    type="button"
                                                    className={clsx(styles.btn, styles.btnPrimary, styles.ratesBoxBtn, styles.submitApp)}
                                                    onClick={showModal}
                                                >
                                                    Подключиться

                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.header36} id="contacts">КОНТАКТЫ</div>
                                <div
                                    style={{ display: 'flex', marginBottom: '160px', justifyContent: 'space-between', marginLeft: '50px', marginRight: '50px' }}
                                >
                                    <div>
                                        <div className={styles.contactsPhone}>
                                            +7 (495) 640-27-74
                                        </div>
                                        <div className={styles.contactsAddress}>
                                            info@bssg.ru
                                        </div>
                                        <div className={styles.contactsAddress} style={{ marginTop: '43px' }}>
                                            121205, Москва, Большой бульвар, д. 42 стр. 1
                                            <br />
                                            {' '}
                                            Технопарк Сколково
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex' }}>
                                            <img src={pdf} className={styles.imgPdf} />
                                            <a
                                                onClick={() => { window.open('https://storage.yandexcloud.net/lottabyte-doc/connection_guide.pdf'); }}
                                                style={{ cursor: 'pointer' }}
                                                className={styles.contactsLinks}
                                            >
                                                Инструкция по подключению
                                            </a>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <img src={pdf} className={styles.imgPdf} />
                                            <div
                                                onClick={() => { window.open('https://storage.yandexcloud.net/lottabyte-doc/ugLottaByte.1.4.7.pdf'); }}
                                                style={{ cursor: 'pointer' }}
                                                className={styles.contactsLinks}
                                            >
                                                Руководство пользователя
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className={styles.logo} />
                    <div style={{ flexDirection: 'column', display: 'flex' }}>
                        <a className={styles.footerTextLinks} style={{ cursor: 'pointer' }} onClick={() => { document.getElementById('about_service')!.scrollIntoView(); }}>О сервисе</a>
                        <a className={styles.footerTextLinks} onClick={() => { document.getElementById('advantages')!.scrollIntoView(); }} style={{ marginTop: '20px', cursor: 'pointer' }}>Преимущества</a>
                    </div>
                    <div style={{ flexDirection: 'column', display: 'flex' }}>
                        <a className={styles.footerTextLinks} style={{ cursor: 'pointer' }} onClick={() => { document.getElementById('rates')!.scrollIntoView(); }}>Тарифы</a>
                        <a className={styles.footerTextLinks} onClick={() => { document.getElementById('contacts')!.scrollIntoView(); }} style={{ marginTop: '20px', cursor: 'pointer' }}>Контакты</a>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className={styles.footerPhone}>+7 (495) 640-27-74</div>
                        <div className={styles.footerText}>
                            121205, Москва, Большой бульвар, д. 42 стр. 1
                            <br />
                            Технопарк Сколково
                        </div>
                    </div>
                </div>
            </footer>

            <Modal
                show={isShowModal}
                backdrop={false}
                onHide={closeModal}

            >
                <div className={clsx(styles.modalContent, styles.submitAppForm)}>
                    <Modal.Header closeButton className={styles.modalHeader}>
                        <Modal.Title className={styles.modalTitle}>Оставьте заявку!</Modal.Title>

                    </Modal.Header>
                    <Form noValidate validated={validated} onSubmit={sendMessage}>
                        <Modal.Body className={styles.modalBody}>

                            <Form.Group controlId="form.email">
                                <Form.Label htmlFor="email" className="md-5">E-mail</Form.Label>
                                <Form.Control
                                    className="md-7"
                                    type="email"
                                    id="email"
                                    placeholder="name@example.com"
                                    aria-describedby="emailHelpBlock"
                                    required
                                />
                                <Form.Text id="emailHelpBlock" muted>
                                    Введите ваш контактный почтовый адрес
                                </Form.Text>
                            </Form.Group>
                            <Form.Group controlId="form.name">
                                <Form.Label htmlFor="name" className="md-5">Имя</Form.Label>
                                <Form.Control
                                    className="md-7"
                                    type="text"
                                    id="name"
                                    placeholder="Иванов Иван Иванович"
                                    aria-describedby="nameHelpBlock"
                                    required
                                />
                                <Form.Text id="nameHelpBlock" muted>
                                    Введите ваше имя
                                </Form.Text>
                            </Form.Group>
                            <Form.Group controlId="form.phone">
                                <Form.Label htmlFor="phone" className="md-5">Телефон</Form.Label>
                                <Form.Control
                                    className="md-7"
                                    type="phone"
                                    id="phone"
                                    placeholder="+7 999 555-55-55"
                                    aria-describedby="phoneHelpBlock"
                                />
                                <Form.Text id="phoneHelpBlock" muted>
                                    Введите ваше телефон
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="confPolicy" className="md-5">
                                    {' '}
                                    Я подтверждаю, что знаком с &nbsp;
                                    <a
                                        onClick={() => { window.open('https://storage.yandexcloud.net/lottabyte-doc/conf.pdf'); }}
                                        style={{ textDecoration: 'none', color: '#375DBE', cursor: 'pointer' }}
                                    >
                                        Политикой конфиденциальности
                                    </a>
                                </Form.Label>
                                <Form.Check
                                    required
                                    feedback="Вы должны согласиться с Политикой конфиденциальности"
                                    feedbackType="invalid"
                                    id="confPolicy"
                                />
                            </Form.Group>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                className={clsx(styles.btn, styles.btnPrimary)}
                                type="submit"
                                variant="primary"

                            >
                                Отправить заявку
                            </Button>
                            <Button
                                className={clsx(styles.btn, styles.btnPrimary)}
                                variant="secondary"
                                onClick={closeModal}
                            >
                                Отмена
                            </Button>
                        </Modal.Footer>
                    </Form>
                </div>
            </Modal>

        </>
    );
};
