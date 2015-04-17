# Tests

* Ping ponging messages increasing in size
* Sending JSON that is modified then sent back

## TODO

* check that an error is thrown if data size is too big
* check that 2 events are emitted if 2 messages are bundled together in the same send
* check that a message is well reconstructed when split in 2 data events