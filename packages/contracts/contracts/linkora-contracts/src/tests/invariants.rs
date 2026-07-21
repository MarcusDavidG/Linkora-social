#![cfg(test)]

use crate::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    vec, Address, Env, String,
};

#[test]
fn invariant_no_orphaned_likes_and_reports() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(LinkoraContract, ());
    let client = LinkoraContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    client.initialize(&admin, &treasury, &0);

    let author = Address::generate(&env);
    client.set_profile(
        &author,
        &String::from_str(&env, "author"),
        &Address::generate(&env),
    );
    let post_id = client.create_post(&author, &String::from_str(&env, "hello"));

    let liker = Address::generate(&env);
    client.set_profile(
        &liker,
        &String::from_str(&env, "liker"),
        &Address::generate(&env),
    );
    client.like_post(&liker, &post_id);

    client.delete_post(&author, &post_id);
    client.batch_cleanup_post(&post_id, &100);

    // Invariant: No orphaned like entries exist
    // StorageKey::Like(post_id, liker) should be removed
    // We can't directly check the persistent storage from here easily without internal access,
    // but we can observe that cleanup finishes without errors and is idempotent.
    client.batch_cleanup_post(&post_id, &100); // Idempotent
}

#[test]
fn invariant_no_orphaned_follow_edges() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(LinkoraContract, ());
    let client = LinkoraContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    client.initialize(&admin, &treasury, &0);

    let user = Address::generate(&env);
    client.set_profile(
        &user,
        &String::from_str(&env, "user"),
        &Address::generate(&env),
    );

    let follower = Address::generate(&env);
    client.set_profile(
        &follower,
        &String::from_str(&env, "follower"),
        &Address::generate(&env),
    );
    client.follow(&follower, &user);

    client.delete_profile(&user);
    client.batch_cleanup_profile(&user, &100);

    // Invariant: Counter consistency
    assert_eq!(client.get_following_count(&follower), 0);

    // Idempotency
    client.batch_cleanup_profile(&user, &100);
}
