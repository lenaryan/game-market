import React, {useContext, useState } from 'react';
import {BuyStatus, Purchase} from '../../data/types';
import {CurrentUserContext} from '../Context';
import { USERS } from '../../data/api/data';
import { UserInfo } from '../../data/types';
import './PurchaseForm.css';

interface PurchaseFormProps {
    value: Purchase;
    onChange: (value: Purchase) => void;
    buyStatus?: BuyStatus;
}

export function PurchaseForm({value, buyStatus, onChange}: PurchaseFormProps) {
    const [ showInvite, setShowInvite ] = useState(false);
    const [ currentDisclaimer, setCurrentDisclaimer ] = useState(false);
    const [ currentAgeDisclaimer, setCurrentAgeDisclaimer ] = useState(false);
    const currentUser = useContext(CurrentUserContext);
    const inviteRef = React.useRef<HTMLFormElement>(null);

    let friendsIds: number[] | undefined;
    let friendsList: UserInfo[] = [];

    USERS.forEach(user => {
        if (user.id == currentUser?.id) {
            friendsIds = user.friendIds;
        }
    })

    USERS.forEach(user => {
        if (friendsIds?.includes(user.id)) {
            friendsList.push(user);
        }
    })

    // nah, it's not sorting :/
    let sortedFriends: UserInfo[] = friendsList.sort((a: UserInfo, b: UserInfo) => +(b.name < a.name))

    const invitationForm = (e: React.ChangeEvent<HTMLInputElement>) => {

        // shouldComponentUpdate или useEffect, чтобы избежать ререндера?..

        if (showInvite) {
            setShowInvite(false);
            inviteRef.current?.reset();
        } else {
            setShowInvite(true);
        }
    }

    const renderNextEmail = (e: React.FormEvent<HTMLInputElement>) => {
        if (e.currentTarget.nextSibling?.nodeName !== 'INPUT') {

            let num: string = String(e.currentTarget.dataset.testid).slice(5);
            let order: number = parseInt(num);

            const newInput = document.createElement("input");
            newInput.setAttribute('type', 'email');
            newInput.setAttribute('class', 'email');
            newInput.setAttribute('data-testid', `email${++order}`);
            newInput.setAttribute('placeholder', 'friend\'s e-mail');

            e.currentTarget.after(newInput);
        }
    }

    const showCurrentDisclaimer = (e: React.FormEvent<HTMLInputElement>) => {
        if (!currentUser?.age && value.game.restrictions?.minAge) {
            setCurrentAgeDisclaimer(true);
            e.currentTarget.checked = false;
        } else {
            setCurrentAgeDisclaimer(false);
        }

        if (currentUser?.age && value.game.restrictions?.minAge && ( currentUser?.age < value.game.restrictions?.minAge )) {
            setCurrentDisclaimer(true);
            e.currentTarget.checked = false;
        } else {
            setCurrentDisclaimer(false);
        }
    }

    return (
        <div>
            <ul className="people">
                <li className="check">
                    <label data-testid={ 'user' + currentUser?.id + 'Label' }>
                        <input type="checkbox" data-testid={ 'user' + currentUser?.id }
                            onClick={ showCurrentDisclaimer }
                        />
                        {currentUser?.name} (me)
                    </label>
                    {
                        currentDisclaimer &&
                        <p className="disclaimer" data-testid={ 'user' + currentUser?.id  + 'incorrectAge' }>The person is not allowed to get the game due to age restriction</p>
                    }
                    {
                        currentAgeDisclaimer &&
                        <p className="disclaimer" data-testid={ 'user' + currentUser?.id  + 'noAge' }>Cannot be selected unless user's age is specified, because the game has age restriction</p>
                    }
                </li>

                {
                    sortedFriends.map((friend, index) => (
                        <li key={index} className="check">
                            <label data-testid={ 'user' + friend?.id + 'Label' }>
                                <input type="checkbox" data-testid={'user' + (friend.id)} 
                                    disabled={ 
                                        (!friend?.age) ||
                                        (friend?.age && 
                                        value.game.restrictions?.minAge && 
                                        (friend?.age < value.game.restrictions?.minAge)) ? 
                                        true : false 
                                    }
                                />
                                {friend.name}
                            </label>
                            {
                                friend?.age && value.game.restrictions?.minAge && ( friend?.age < value.game.restrictions?.minAge ) &&
                                <p className="disclaimer" data-testid={ 'user' + friend?.id  + 'incorrectAge' }>The person is not allowed to get the game due to age restriction</p>
                            }
                            {
                                !friend?.age && value.game.restrictions?.minAge &&
                                <p className="disclaimer" data-testid={ 'user' + friend?.id  + 'noAge' }>Cannot be selected unless user's age is specified, because the game has age restriction</p>
                            }
                        </li>
                    ))
                }
            </ul>

            <label className="check">
                <input type="checkbox" data-testid="showInvite" onChange={invitationForm} />
                Invite friends
            </label>

            {
                showInvite &&
                <form ref={inviteRef} className="invite" data-testid="invite">
                    <input className="email" type="email" id="email0" data-testid="email0" onChange={renderNextEmail} placeholder="friend's e-mail" />
                    <div>
                        <label className="acknowledge">
                            <input type="checkbox" data-testid="acknowledgeInvite" required />
                            I acknowledge that Game Market invitation emails will be sent to specified emails. The game will become available to the person only onсe the registration in the Game Market is completed.
                        </label>
                    </div>

                    {
                        value.game.restrictions &&
                        <div>
                            <label className="acknowledge">
                                <input type="checkbox" data-testid="acknowledgeInviteAge" required />
                                I acknowledge that the game has age restriction and might be unavailable if a person is under required age.
                            </label>
                        </div>
                    }
                </form>
            }
        </div>
    );
}
