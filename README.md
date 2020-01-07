# Push Server

This server can be used as a central location for handling the distribution of push notifications to iOS applications.

It has two endpoints: `/newtoken` and `/newpush`, which are used to record newly-registered device tokens and send notifications to the devices associated with these tokens, respectively.

For notifications to be sent, you'll have to clone this repo and add an APNS push key (named `apns_push_key.p8`) in the root directory. You'll then need to store the following either as environment variables or as exported variables in a file called `config.js` (also in the root directory of this repo):

- `keyId`
- `teamId`

Both are 10-character identifiers that can be obtained from your [developer account](https://developer.apple.com/account/).

## Running the server
To start the server, run `npm start`.

## Registering tokens
POST requests to `/newtoken` should be made from the [`application:didRegisterForRemoteNotificationsWithDeviceToken:`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622958-application?language=swift) delegate method and include the following fields in the body:

- `token`: Device token (method parameter)
- `bundledId`: Bundle identifier for the current application (can be obtained programmatically as `Bundle.main.bundleIdentifier`)

The tokens are stored in a local cache using [`Memcachier`](https://devcenter.heroku.com/articles/memcachier) to allow deployment to Heroku, but this can be configured by modifying [`tokens.js`](src/tokens.js).

To use Memcachier, you'll have to provision it on your Heroku application. Doing so adds the following environment variables to your Heroku deployment. You can access this cache locally (and thus run this server locally) by adding them to your `config.js` configuration file (or storing them as environment variables locally).

- `MEMCACHIER_USERNAME`
- `MEMCACHIER_SERVERS`
- `MEMCACHIER_PASSWORD`

If you choose to use Memcachier for storage, you should also include a variable called `USES_MEMCACHIER` and set it to `true` to indicate that these config variables should be used to access Memcachier.

Otherwise, writes will be to local disk storage instead (see [`server.js`](src/server.js) and [`disk.js`](src/disk.js) for more information). Local disk storage is the default behavior if `USES_MEMCACHIER` is not set.

Running [`archive.js`](src/archive.js) will create a file called `backup.json` on the disk containing all currently-stored token information in the following format:

```json
{
    "bundleId1": [
        "token1": {
            "createdAt": "isoDate1",
            "updatedAt": "isoDate2"
        },
        "token2": {...},
        ...
    ],
    "bundleId2": [...],
    ...
}
```

## Sending push notifications
To send a push notification, send a POST request to `/newpush` with the following fields:

- `bundleId`: Bundle identifier for the app whose users should receive the notification
- `body`: Body of the push notification
- `title` *(optional)*: Title of the push notification (displays in bold above the body on newer iOS versions)

If successful, the request will return status code 200 and send out the notification to all registered devices stored in the cache.

## Migration

By default, [`tokens.js`](src/tokens.js) will use `backup.json` as a fallback if it cannot find any registered tokens in the cache when a request is made (such as when `/newpush` is called). This makes it easy to migrate old records to the Memcachier cache used for this server – simply save your old tokens in the same format [shown above](#registering-tokens) as a file called `backup.json` (an example is included in this repo) and it will be imported to the cache on the next call.

If you're coming from now-defunct Parse, you can use [`migrate.js`](src/migrate.js) to create the backup file for import. Just place your LegacyParseData file in your clone of this repo and update the list of bundle identifiers to extract from.

You can create a new backup file from what's currently stored in the Memcachier cache at any time by running [`archive.js`](src/archive.js), or use the [`getRawTokenData`](src/tokens.js#L93) method in `tokens.js` to obtain this data programmatically.
